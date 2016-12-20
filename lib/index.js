import {webFrame} from 'electron'
import {remote} from 'electron';
import Vue from 'vue'

import ChartLyrics from './chartlyrics'
import SpotifyAPI from './spotify_api'
import Strings from './strings'

Vue.component('detecting-spotify', {
  props: ['trackId', 'track'],
  template: `
    <div id='detecting-spotify'>
      <h1>Automatically detecting Spotify...</h1>

      <div v-if="!trackId || !track" class='spinner'></div>
    </div>
  `
})

Vue.component('lyrics-viewer', {
  props: ['trackId', 'track', 'lyrics'],
  template: `
    <div id='track-with-lyrics'>
      <h1 id="track_name">{{ track.name }}</h1>
      <h2 id="artist">
        <span v-for="(artist, index) in track.artists">{{ artist.name }}<span v-if="index < track.artists.length - 1">, </span>
        </span>
      </h2>
      <pre id="lyrics" v-html="lyrics"></pre>
    </div>
  `
})

window.app = new Vue({
  el: '#app',
  data: {
    track: null,
    trackId: null,
    lyrics: null,
    firstResized: false,
    view: 'detecting-spotify'
  },
  watch: {
    trackId: function(trackId) {
      if (this.trackId) {
        this.refreshTrack()
      } else {
        this.setView('detecting-spotify')
      }
    },
    track: function() {
      if (this.track) {
        this.setView('lyrics-viewer')
        this.refreshLyrics()
      } else {
        this.setView('detecting-spotify')
      }
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
        this.lyrics = Strings.LYRICS_NOT_FOUND
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

    setView: function(viewName) {
      this.view = viewName

      if (viewName == 'lyrics-viewer' && !this.firstResized) {
        this.setMinHeight(600)
        this.firstResized = true
      }
    },

    setMinHeight: function(height) {
      try {
        let win = remote.getCurrentWindow()
        let size = win.getSize()
        if (size[1] >= height) return
        win.setSize(size[0], height, true)
      } catch (e) {
        console.log(e)
      }
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
