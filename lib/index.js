import Vue from 'vue'
import ChartLyrics from './chartlyrics'
import SpotifyAPI from './spotify_api'
import {webFrame} from 'electron'

window.app = new Vue({
  el: '#app',
  data: {
    track: null,
    trackId: null,
    lyrics: null
  },
  watch: {
    trackId: function() {
      if (this.trackId) this.refreshTrack()
    },
    track: function() {
      if (this.track) this.refreshLyrics()
    }
  },
  methods: {
    refreshTrack: function() {
      this.spotifyAPI.getTrackById(this.trackId, function (error, trackInfo) {
        if (error) {
          this.track = null
        } else {
          this.track = trackInfo
        }
      }.bind(this))
    },

    refreshLyrics: function() {
      let candidates = []

      if (this.track.artists.length > 1) {
        let collabName = this.track.artists
          .map((cur, i, a) => a[i].name)
          .join(', ')

        candidates.push(collabName)
      }

      for (var artist in this.track.artists) {
        candidates.push(this.track.artists[artist].name)
      }

      this.artistCandidates = candidates.reverse()
      this.searchLyrics()
    },

    searchLyrics: function() {
      if (!Array.isArray(this.artistCandidates) ||
          this.artistCandidates.length == 0) {
        this.lyrics = "We're sorry we could not find lyrics for this song! 😔"
        return;
      }

      let currentCandidate = encodeURIComponent(this.artistCandidates.pop())
      let trackName = this.track.name

      // TODO: refactor this 😂
      this.chartLyrics.searchLyrics(
        currentCandidate,
        trackName,
        function (error, results) {
          if (error) {
            setTimeout(this.searchLyrics.bind(this), 100)
          } else {
            let payload = results[0]

            this.chartLyrics.getLyricsById(
              payload.lyricId,
              payload.lyricChecksum,
              function (error, lyrics) {
                if (error) {
                  setTimeout(this.searchLyrics.bind(this), 200)
                } else {
                  this.lyrics = lyrics
                  this.artistCandidates = null
                }
              }.bind(this)
            )
          }
        }.bind(this)
      )
    },

    /* Hacks to fix HDPI font rendering issues on linux */
    fixLinuxRenderingIssue: function() {
      // Zoom in webframe
      webFrame.setZoomFactor(2)

      // Apply fix classes. Zooms out
      document.documentElement.className = "html-linux"
      document.body.className = "body-linux"
      document.getElementById('artist').className = 'artist-linux'
    },

    _mainProcess_setCurrentTrackId: function (newTrackId) {
      this.trackId = newTrackId
    }
  },

  created: function () {
    this.spotifyAPI = new SpotifyAPI()
    this.chartLyrics = new ChartLyrics()

    if (process.platform == 'linux') {
      this.fixLinuxRenderingIssue()
    }
  }
})
