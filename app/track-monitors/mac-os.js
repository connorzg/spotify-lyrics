const EventEmitter = require('events').EventEmitter
const exec = require('child_process').exec
const path = require('path')

const DARWIN_SCRIPT_PATH = path.join(
  __dirname,
  "../../control/get_current_track_id.scpt"
).replace(/ /g, '\\ ')

const GET_TRACK_COMMAND = "osascript " + DARWIN_SCRIPT_PATH
const MONITOR_POLL_INTERVAL = 4000


let TrackMonitor = function() {
  this.running = false
}

TrackMonitor.prototype.__proto__ = EventEmitter.prototype;

TrackMonitor.prototype.start = function() {
  this.running = true
  this.doMonitor()
}

TrackMonitor.prototype.doMonitor = function() {
  if (!this.running) {
    return
  }

  this._getCurrentTrack()

  if (this.running) {
    setTimeout(this.doMonitor.bind(this), MONITOR_POLL_INTERVAL)
  }
}

TrackMonitor.prototype.stop = function() {
  this.running = false
}

TrackMonitor.prototype._getCurrentTrack = function() {
  exec(GET_TRACK_COMMAND, function(err, stdout, stderr) {
    if (err) {
      console.log("Could not fetch current track.", err)
    } else {
      stdout = stdout.replace('\n', '')
      let trackId = stdout.split(':').pop()
      this.emit('track-changed', trackId)
    }
  }.bind(this))
}

module.exports = TrackMonitor
