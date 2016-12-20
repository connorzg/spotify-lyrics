import axios from 'axios'
import url from 'url'

const SPOTIFY_API_URL = 'https://api.spotify.com/v1/tracks/'

export default class SpotifyAPI {
  getTrackById (trackId, callback) {
    let trackUrl = SPOTIFY_API_URL + trackId

    axios.get(trackUrl)
      .then(function(response) {
        callback(null, response.data)
      })
      .catch(function(error) {
        callback(error)
      })
  }
}
