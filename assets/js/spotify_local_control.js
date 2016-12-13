const exec = require('child_process').exec
const path = require('path')

const SCRIPT_PATH = path.join(
  __dirname,
  "../../control/get_current_track_id.scpt"
)

let SpotifyLocalControl = function() {
}

SpotifyLocalControl.prototype.getCurrentTrackId = function(callback) {
  exec("osascript " + SCRIPT_PATH,
    function(err, stdout, stderr) {
      if (err) {
        callback(err)
      } else {
        stdout = stdout.replace('\n', '')
        let trackId = stdout.split(':').pop()
        callback(null, trackId)
      }
  })
}

module.exports = SpotifyLocalControl

