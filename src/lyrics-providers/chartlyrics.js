import axios from 'axios'
import {select} from 'xpath'
import {DOMParser} from 'xmldom'

const CHARTLYRICS_API_URL = 'http://api.chartlyrics.com/apiv1.asmx'
const CHARTLYRICS_SEARCH_URL = CHARTLYRICS_API_URL + '/SearchLyric'
const CHARTLYRICS_GET_URL = CHARTLYRICS_API_URL + '/GetLyric'

export default class ChartLyrics {

  getXMLTree (xml) {
    xml = xml.replace('xmlns="http://api.chartlyrics.com/"', '')
    return new DOMParser().parseFromString(xml).documentElement
  }

  search (artistName, trackName, callback) {
    axios.get(
      CHARTLYRICS_SEARCH_URL,
      { params: { artist: artistName, song: trackName } }
    )
    .then((response) => {
      let root = this.getXMLTree(response.data)
      let results = select("./SearchLyricResult", root)
      let lyricsIds = []

      for (var node in results) {
        let lyricChecksum = select("./LyricChecksum/text()", results[node])
          .toString()
        let lyricId = select("./LyricId/text()", results[node]).toString()

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
    .catch((err) => {
      callback(err)
    })
  }

  getLyricsById (id, callback) {
    let lyricId, lyricChecksum = id

    axios.get(CHARTLYRICS_GET_URL, {
      params: {
        lyricId: lyricId,
        lyricCheckSum: lyricChecksum
      }
    })
    .then((response) => {
      let root = this.getXMLTree(response.data)
      let lyrics = select('./Lyric/text()', root)[0].toString()
      callback(null, lyrics)
    })
    .catch((err) => {
      callback(err)
    })
  }
}
