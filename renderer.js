var BACKEND_URL = 'http://localhost:8000'
var CURRENT_TRACK_URL = [BACKEND_URL, 'current_track.json'].join('/')

function GET(url, onSuccess, onError) {
  var request = new XMLHttpRequest()

  request.open("GET", url, true)
  request.onreadystatechange = function () {
    if (request.readyState != 4)
      return

    if (request.status != 200) {
      onError(request.status)
      return
    }

    return onSuccess(request.responseText)
  }
  request.send("")
}

var TrackPresenter = function(track) {
  this.track = track
}

TrackPresenter.prototype.getTrackName = function() {
  return this.track.name;
}

TrackPresenter.prototype.getArtist = function() {
  var artists_names = []

  for (artist in this.track.artists) {
    artists_names.push(this.track.artists[artist].name)
  }

  return artists_names.join(', ')
}

TrackPresenter.prototype.getLyrics = function() {
  return this.track.lyrics
}

var App = function() {
  this.div = document.getElementById('app')
  this.trackName = document.getElementById('track_name')
  this.artist = document.getElementById('artist')
  this.lyrics = document.getElementById('lyrics')

  this.MONITOR_POLL_INTERVAL = 5000
  this.monitoring = false;
  this.currentTrack = null;
}

App.prototype.initialize = function() {
  console.log('Initializing app...')

  this.startTrackMonitor()
}

App.prototype.startTrackMonitor = function() {
  console.log('Starting track monitor...');

  this.monitoring = true
  this.doMonitor()
}

App.prototype.doMonitor = function() {
  if (this.monitoring) {
    // Trigger next run
    setTimeout(this.doMonitor.bind(this), this.MONITOR_POLL_INTERVAL)
  }

  console.log('Monitor running...')

  GET(
    CURRENT_TRACK_URL,
    this.onGetCurrentTrackSuccess.bind(this),
    this.onGetCurrentTrackFail.bind(this)
  )
}

App.prototype.stopTrackMonitor = function() {
  console.log('Stopping track monitor...')

  this.monitoring = false
}

App.prototype.onGetCurrentTrackSuccess = function(body) {
  var trackInfo = JSON.parse(body)

  if (this.currentTrack == null ||
      trackInfo.id != this.currentTrack.id) {
    this.updateCurrentTrack(trackInfo)
  } else {
    console.log("Still playing the same track")
  }
}

App.prototype.onGetCurrentTrackFail = function(statusCode) {
  console.log(
    "Error fetching current track from the backend. Is it still up?",
    statusCode
  )
}

App.prototype.updateCurrentTrack = function(newTrack) {
  console.log('New track detected')
  this.currentTrack = newTrack
  this.notifyTrackChanged()
}

App.prototype.notifyTrackChanged = function() {
  this.render()
}

App.prototype.render = function() {
  console.log("Rendering...");

  var track = new TrackPresenter(this.currentTrack)

  this.trackName.innerText = track.getTrackName()
  this.artist.innerText = track.getArtist()
  this.lyrics.innerText = track.getLyrics()
}

window.addEventListener("load", function() {
  window.app = new App()
  window.app.initialize()
})