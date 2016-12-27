<template>
  <div class='track-with-lyrics'>
    <h1 class="track_name">{{ track.name }}</h1>
    <h2 class="artist">
      <span v-for="(artist, index) in track.artists">{{ artist.name }}<span v-if="index < track.artists.length - 1">, </span>
      </span>
    </h2>
    <pre class="lyrics" v-html="lyrics"></pre>
  </div>
</template>

<script>
  import Vue from 'vue'
  import AsyncComputed from 'vue-async-computed'
  import LyricsProvider from '../lyrics-provider'
  import Strings from '../strings'

  Vue.use(AsyncComputed)

  export default {
    components: { Spinner },
    data () {
      return {
        lyrics: null,
      }
    },
    props: ['track'],
    asyncComputed: {
      lyrics: {
        get () {
          return new Promise(function(resolve, reject) {
            let lyricsProvider = new LyricsProvider()

            lyricsProvider.getLyrics(
              this.track.artists,
              this.track.name,
              function(error, lyrics) {
                if (error) {
                  resolve(Strings.LYRICS_NOT_FOUND)
                } else {
                  resolve(lyrics)
                }
              }.bind(this)
            )
          }.bind(this))
        },
        default: ''
      }
    }
  }
</script>

<style lang="sass">
  $text-color-medium: #88898c;

  .artist {
    color: $text-color-medium;
  }

  .lyrics {
    margin-top: 16px;
  }

  /* typography */

  .lyrics {
    font-weight: 200;
    word-break: break-word;
    word-wrap: break-word;
    font-size: 1em;
    /* equivalent to 16px */
    line-height: 1.25;
    /* equivalent to 20px */
  }

  @media (min-width: 43.75em) {
    .lyrics {
      font-size: 1em;
      /* equivalent to 16px */
      line-height: 1.375;
      /* equivalent to 22px */
    }
  }
</style>
