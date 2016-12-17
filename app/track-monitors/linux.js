const EventEmitter = require('events').EventEmitter
const forever = require('forever-monitor')
const exec = require('child_process').exec;
const os = require('os')

const DBUS_MONITOR_COMMAND = ["dbus-monitor", "path=/org/mpris/MediaPlayer2"]
const TRACK_RE = /spotify:track:(\w+)/

let TrackMonitor = function() {
  this.monitorProcess = null
}

TrackMonitor.prototype.start = function() {
  this.monitorProcess = forever.start(DBUS_MONITOR_COMMAND, {
    silent: true,
    killTree: true
  })
  this.monitorProcess.on('stdout', this._onData.bind(this))

  this._hackTriggerSpotifySongAdvertisement()
}

TrackMonitor.prototype.stop = function() {
  process.nextTick(function() {
    this.monitorProcess.kill(true)
  }.bind(this))
}

TrackMonitor.prototype._onData = function(rawData) {
  let data = String.fromCharCode.apply(null, new Uint16Array(rawData));
  let matches = TRACK_RE.exec(data)

  if (Array.isArray(matches) && matches.length > 1) {
    this.emit('track-changed', matches[1])
  }
}

/* Triggers spotify's song advertisement on DBUS by toggling play/pause */
TrackMonitor.prototype._hackTriggerSpotifySongAdvertisement = function() {
  exec(
    "dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause")
  exec(
    "dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause")
}

TrackMonitor.prototype.__proto__ = EventEmitter.prototype;

module.exports = TrackMonitor
