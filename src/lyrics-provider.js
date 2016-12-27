import ChartlyricsProvider from './lyrics-providers/chartlyrics'
import LyricsWikia from './lyrics-providers/lyrics-wikia'

export default class LyricProvider {
  constructor () {
    this.artistCandidates = []
    // this.provider = new ChartlyricsProvider()
    this.provider = new LyricsWikia()
  }

  getArtistCandidates (artists) {
    let candidates = []
    let artistNames = artists.map((cur, i, a) => a[i].name)

    if (artists.length > 1) {
      candidates.push(artistNames.join(', '))
    }

    Array.prototype.push.apply(candidates, artistNames)
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
      this.responseCallback(new Error("Lyrics not found"))
      return;
    }

    let currentCandidate = encodeURIComponent(this.artistCandidates.pop())

    // TODO: refactor this 😂
    this.provider.search(
      currentCandidate,
      this.trackName,
      function (error, results) {
        if (error) {
          setTimeout(this.searchLyrics.bind(this), 100)
        } else {
          let id = results[0]

          this.provider.getLyricsById(id,
            function (error, lyrics) {
              if (error) {
                setTimeout(this.searchLyrics.bind(this), 200)
              } else {
                this.artistCandidates = null
                this.responseCallback(null, lyrics)
              }
            }.bind(this)
          )
        }
      }.bind(this)
    )
  }
}
