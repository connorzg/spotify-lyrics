const Vue = require('./vue.min.js')

const ChartLyrics = require('./chartlyrics.js')
const SpotifyAPI = require('./spotify_api.js')
const SpotifyLocalControl = require('./spotify_local_control.js')
const TRACK_DETECTION_POLL_MS = 4000

var app = new Vue({
  el: '#app',
  data: {
    track: null,
    trackId: null,
    lyrics: null
  },
  watch: {
    trackId: function() {
      if (this.trackId) {
        this.refreshTrack()
      }
    },
    track: function() {
      if (this.track) {
        this.refreshLyrics()
      }
    }
  },
  methods: {
    monitorTrack: function() {
      let self = this

      this.spotifyLocalControl.getCurrentTrackId(function(err, trackId) {
        if (err) {
          self.trackId = null
        } else {
          self.trackId = trackId
        }
      })

      setTimeout(this.monitorTrack, TRACK_DETECTION_POLL_MS)
    },

    refreshTrack: function() {
      let self = this

      console.log('Refreshing track info', this.trackId)

      this.spotifyAPI.getTrackById(this.trackId, function(error, trackInfo) {
        if (error) {
          console.log('Could not fetch track', error)
          self.track = null
        } else {
          self.track = trackInfo
        }
      })
    },

    refreshLyrics: function() {
      let candidates = []

      if (this.track.artists.length > 1) {
        let collabName = this.track.artists.map(function(cur, i, a) {
          return a[i].name;
        }).join(', ')

        candidates.push(collabName)
      }

      for (var artist in this.track.artists) {
        candidates.push(this.track.artists[artist].name)
      }

      this.artistCandidates = candidates.reverse()
      this.searchLyrics()
    },

    searchLyrics: function() {
      let self = this

      if (!Array.isArray(this.artistCandidates) ||
          this.artistCandidates.length == 0) {
        console.log('No more candidates to check')
        this.lyrics = "We're sorry we could not find lyrics for this song! 😔"
        return;
      }

      let currentCandidate = encodeURIComponent(this.artistCandidates.pop())
      let trackName = this.track.name

      console.log('Searching for', currentCandidate, trackName)

      // TODO: refactor this 😂
      this.chartLyrics.searchLyrics(currentCandidate, trackName,
        function(error, results) {
          if (error) {
            console.log('Could not find lyrics, trying next candidate')
            setTimeout(self.searchLyrics.bind(self), 100)
          } else {
            let payload = results[0]

            self.chartLyrics.getLyricsById(
              payload.lyricId,
              payload.lyricChecksum,
              function(error, lyrics) {
                if (error) {
                  console.log('Could not fetch lyrics, trying next')
                  setTimeout(self.searchLyrics.bind(self), 200)
                } else {
                  console.log('Got lyrics!')
                  self.lyrics = lyrics
                  self.artistCandidates = null
                }
              }
            )
          }
        }
      )
    },
  },

  created: function() {
    this.spotifyAPI = new SpotifyAPI()
    this.spotifyLocalControl = new SpotifyLocalControl()
    this.chartLyrics = new ChartLyrics()
    this.monitorTrack()
  }
})
