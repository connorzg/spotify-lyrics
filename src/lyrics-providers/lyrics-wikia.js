import axios from 'axios'

export default class LyricsWikia {
  search (artistName, title) {
    let url = `http://lyrics.wikia.com/api.php?action=lyrics&artist=${encodeURIComponent(artistTemplate)}&song=${encodeURIComponent(title)}&fmt=json&func=getSong`

    axios.get(url)
      .then((response) => {
        console.log(response.data)
      })
      .catch((error) => {
        console.log("err", error)
      })
  }
}
