const axios = require('axios')
const xpath = require('xpath')
const dom = require('xmldom').DOMParser

const CHARTLYRICS_API_URL = 'http://api.chartlyrics.com/apiv1.asmx'
const CHARTLYRICS_SEARCH_URL = CHARTLYRICS_API_URL + '/SearchLyric'
const CHARTLYRICS_GET_URL = CHARTLYRICS_API_URL + '/GetLyric'

var ChartLyrics = function() {
}

ChartLyrics.prototype.getXMLTree = function(xml) {
  xml = xml.replace('xmlns="http://api.chartlyrics.com/"', '')
  return new dom().parseFromString(xml).documentElement
}

ChartLyrics.prototype.searchLyrics = function(artistName, trackName, callback) {
  let self = this

  axios.get(
    CHARTLYRICS_SEARCH_URL,
    { params: { artist: artistName, song: trackName } }
  )
  .then(function(response) {
    let root = self.getXMLTree(response.data)
    let results = xpath.select("./SearchLyricResult", root)
    let lyricsIds = []

    for (var node in results) {
      let lyricChecksum = xpath
        .select("./LyricChecksum/text()", results[node])
        .toString()
      let lyricId = xpath
        .select("./LyricId/text()", results[node])
        .toString()

      if (lyricId != "" && lyricChecksum != "") {
        let payload = {lyricId: lyricId, lyricChecksum: lyricChecksum}
        lyricsIds.push(payload)
      }
    }

    if (lyricsIds.length > 0) {
      callback(null, lyricsIds)
    } else {
      callback(new Error("Could not find lyrics"))
    }
  })
  .catch(function(err) {
    callback(err)
  })
}

ChartLyrics.prototype.getLyricsById = function(lyricId, lyricChecksum, callback) {
  let self = this

  axios.get(CHARTLYRICS_GET_URL, {
    params: {
      lyricId: lyricId,
      lyricCheckSum: lyricChecksum
    }
  })
  .then(function(response) {
    let root = self.getXMLTree(response.data)
    let lyrics = xpath.select('./Lyric/text()', root)[0].toString()
    callback(null, lyrics)
  })
  .catch(function(err) {
    callback(err)
  })
}

module.exports = ChartLyrics
