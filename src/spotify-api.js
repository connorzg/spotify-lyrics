import {get} from 'axios'
import url from 'url'

const SPOTIFY_API_URL = 'https://api.spotify.com/v1/tracks/'

export default class SpotifyAPI {
  getTrackUrl (trackId) {
    return SPOTIFY_API_URL + trackId
  }

  getTrackById (trackId, callback) {
    get(this.getTrackUrl(trackId))
    .then((response) => {
      callback(null, response.data)
    })
    .catch((error) => {
      callback(error)
    })
  }
}
