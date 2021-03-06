const {app, Menu, BrowserWindow} = require('electron')
const {resolve, isAbsolute} = require('path');
const isDev = require('electron-is-dev');

const MenuBuilder = require('./menu')
const TrackMonitor = require('./track-monitor')

if (TrackMonitor === null) {
  console.log("Platform not supported")
  process.exit(-1)
}

const url = 'file://' + resolve(
  isDev ? __dirname : (app.getAppPath() + "/app/"),
  'index.html'
);

let mainWindow
let trackMonitor

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 540,
    height: 420,
    titleBarStyle: 'hidden-inset',
    title: 'Lyrics for Spotify.app',
    frame: false,
    transparent: true,
    icon: resolve(__dirname, 'static/icon.png'),
    backgroundColor: "#121314"
  })
  mainWindow.loadURL(url)
  mainWindow.on('closed', () => {
    mainWindow = null
    if (trackMonitor != null) {
      trackMonitor.stop()
      trackMonitor = null
    }
  })

  // If file is dropped onto the terminal window, navigate event is prevented
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const protocol = typeof url === 'string' && parseUrl(url).protocol
    if (protocol === 'file:') {
      event.preventDefault()
    }
  })
}

function notifyRendererTrackChanged(newTrackId) {
  if (mainWindow === null) return

  // Hack to communicate the new track id to the renderer process
  mainWindow.webContents.executeJavaScript(`
    var event = new CustomEvent(
      "on-track-changed",
      {"detail": "${newTrackId}"}
    )
    window.dispatchEvent(event)
  `)
}

function setupMonitor() {
  if (trackMonitor != null) return
  trackMonitor = new TrackMonitor()
  trackMonitor.start()
  trackMonitor.on('track-changed', notifyRendererTrackChanged)
}

app.commandLine.appendSwitch('js-flags', '--harmony');

app.on('ready', () => {
  createWindow()
  setupMonitor()

  let menu = MenuBuilder()
  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', () => {
  trackMonitor.stop()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
    setupMonitor()
  }
})
