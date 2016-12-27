import axios from 'axios'
import {select} from 'xpath'
import {DOMParser} from 'xmldom'

export default class LyricsWikia {
  search (artistName, trackName, callback) {
    let url = `http://lyrics.wikia.com/api.php?action=lyrics&artist=${encodeURIComponent(artistName)}&song=${encodeURIComponent(trackName)}&fmt=json&func=getSong`

    axios.get(url)
      .then((response) => {
        let url = response.data.match(/'url':'(.*)'/)[1]
        callback(null, [url])
      })
      .catch((error) => {
        callback(error)
      })
  }

  getLyricsById (id, callback) {
    let url = id

    axios.get(url)
      .then((response) => {
        let element = document.createElement('div')
        element.innerHTML = response.data
        let lyrics = element.getElementsByClassName('lyricbox')[0]
        callback(null, lyrics.innerText)
      })
      .catch((error) => {
        callback(error)
      })
  }
}
