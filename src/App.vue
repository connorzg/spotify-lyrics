<template>
  <div id="app">
    <link href="https://fonts.googleapis.com/css?family=Lato:100,300,400" rel="stylesheet">

    <transition name="component-fade" mode="out-in">
      <component :is="view"
                 :track="track">
      </component>
    </transition>
  </div>
</template>

<script>
import Vue from 'vue'
import {webFrame} from 'electron'
import {remote} from 'electron';
import SpotifyAPI from './spotify-api'

import Detector from './components/Detector.vue'
import Lyrics from './components/Lyrics.vue'

export default {
  components: {
    'detector': Detector,
    'lyrics': Lyrics
  },
  data () {
    return {
      track: null,
      trackId: null,
      firstResized: false,
      view: 'detector'
    }
  },
  watch: {
    trackId: function(trackId) {
      if (this.trackId) {
        this.refreshTrack()
      } else {
        this.setView('detector')
      }
    },
    track: function() {
      if (this.track) {
        this.setView('lyrics')
      } else {
        this.setView('detector')
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

      if (viewName == Lyrics && !this.firstResized) {
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
    }
  },

  created: function () {
    this.spotifyAPI = new SpotifyAPI()

    if (process.platform == 'linux') {
      this.fixLinuxRenderingIssue()
    }

    window.addEventListener("on-track-changed", function(e) {
        let newTrackId = e.detail
        this.trackId = newTrackId
    }.bind(this))
  }
}
</script>

<style lang="sass">
  $text-color-dark: #212121;
  $text-color-medium: #88898c;
  $text-color-light: #dfe0e6;
  $background-color: #121314;
  $font-stack: "Lato", "Helvetica Neue", sans-serif;

  h1,
  h2 {
    padding: 0;
    margin: 0;
    font-weight: 100;
  }

  h1 {
    font-size: 2em;
    /* 2x body copy size = 32px */
    line-height: 1.25;
    /* 45px / 36px */
  }

  h2 {
    font-size: 1.625em;
    /* 1.625x body copy size = 26px */
    line-height: 1.15384615;
    /* 30px / 26px */
  }

  @media (min-width: 43.75em) {
    h1 {
      font-size: 2.5em;
      /* 2.5x body copy size = 40px */
      line-height: 1.125;
    }

    h2 {
      font-size: 2em;
      /* 2x body copy size = 32px */
      line-height: 1.25;
    }
  }

  @media (min-width: 56.25em) {
    h1 {
      font-size: 3em;
      /* 3x body copy size = 48px */
      line-height: 1.05;
      /* keep to a multiple of the 20px line height
      and something more appropriate for display headings */
    }

    h2 {
      font-size: 2.25em;
      /* 2.25x body copy size = 36px */
      line-height: 1.25;
    }
  }

  html,
  body,
  pre {
    margin: 0;
    padding: 0;
    font-family: $font-stack;
    font-size: 100%;
    color: $text-color-dark;
  }

  body {
    -webkit-app-region: drag;
  }

  body,
  pre {
    background-color: $background-color;
    color: $text-color-light;
  }

  #app {
    padding: 2.5em 2em;
    font-weight: normal;
  }

  .component-fade-enter-active, .component-fade-leave-active {
    transition: opacity 2s ease;
  }
  .component-fade-enter, .component-fade-leave-active {
    opacity: 0;
  }

  /* Hacks to fix font rendering issue on linux. These classes are added
     dynamically */
  .html-linux {
    text-shadow: $text-color-dark 0 0;
    -webkit-text-stroke: 0.4px $text-color-dark;
    zoom: 0.5;
  }

  .body-linux {
    text-shadow: $text-color-light 0 0;
    -webkit-text-stroke: 0.4px $text-color-light;
  }

  .artist-linux {
    text-shadow: $text-color-medium 0 0;
    -webkit-text-stroke: 0.4px $text-color-medium;
  }
</style>
