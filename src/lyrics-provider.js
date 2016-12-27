import ChartlyricsProvider from './lyrics-providers/chartlyrics'

export default class LyricProvider {
  constructor () {
    this.artistCandidates = []
    this.chartlyricsProvider = new ChartlyricsProvider()
  }

  getArtistCandidates (artists) {
    let candidates = []

    if (artists.length > 1) {
      let collabName = artists
        .map((cur, i, a) => a[i].name)
        .join(', ')

      candidates.push(collabName)
    }

    for (var artist in artists) {
      candidates.push(artists[artist].name)
    }

    candidates = candidates.reverse()

    return candidates
  }

  getLyrics (artists, trackName, callback) {
    this.artistCandidates = this.getArtistCandidates(artists)
    this.trackName = trackName
    this.responseCallback = callback
    this.searchLyrics()
  }

  searchLyrics () {
    if (!Array.isArray(this.artistCandidates) ||
        this.artistCandidates.length == 0) {
      this.artistCandidates = null
      this.responseCallback(new Error("Lyrics not found"))
      this.responseCallback = null
      return;
    }

    let currentCandidate = encodeURIComponent(this.artistCandidates.pop())

    // TODO: refactor this 😂
    this.chartlyricsProvider.searchLyrics(
      currentCandidate,
      this.trackName,
      function (error, results) {
        if (error) {
          setTimeout(this.searchLyrics.bind(this), 100)
        } else {
          let payload = results[0]

          this.chartlyricsProvider.getLyricsById(
            payload.lyricId,
            payload.lyricChecksum,
            function (error, lyrics) {
              if (error) {
                setTimeout(this.searchLyrics.bind(this), 200)
              } else {
                this.artistCandidates = null
                console.log("got lyrics", lyrics)
                this.responseCallback(null, lyrics)
                this.responseCallback = null
              }
            }.bind(this)
          )
        }
      }.bind(this)
    )
  }
}
