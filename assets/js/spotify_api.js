const axios = require('axios')
const url = require('url')

const SPOTIFY_API_URL = 'https://api.spotify.com/v1/'

let SpotifyAPI = function() {}

SpotifyAPI.prototype.getTrackById = function(trackId, callback) {
  let trackUrl = url.resolve(SPOTIFY_API_URL, 'tracks/' + trackId)

  axios.get(trackUrl)
    .then(function(response) {
      callback(null, response.data)
    })
    .catch(function(error) {
      callback(error)
    })
}

module.exports = SpotifyAPI
