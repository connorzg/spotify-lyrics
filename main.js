const {app, Menu, BrowserWindow} = require('electron')

const path = require('path')
const url = require('url')
const package = require('./package.json')

const MenuBuilder = require('./menu')
const TrackMonitor = require('./src/track-monitor')

if (TrackMonitor === null) {
  console.log("Platform not supported")
  process.exit(-1)
}

let mainWindow
let trackMonitor

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/img/icon.png'),
    title: package.description,
    frame: false,
    backgroundColor: "#121314"
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.toggleDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
    trackMonitor.stop()
    trackMonitor = null
  })
}

function notifyRendererTrackChanged(newTrackId) {
  if (mainWindow === null) return

  // Hack to communicate the new track id to the renderer process
  mainWindow.webContents.executeJavaScript("window.app._mainProcess_setCurrentTrackId(\"" + newTrackId + "\")")
}

app.on('ready', function () {
  createWindow()
  trackMonitor = new TrackMonitor()

  let menu = MenuBuilder()
  Menu.setApplicationMenu(menu)

  trackMonitor.start()
  trackMonitor.on('track-changed', notifyRendererTrackChanged)
})

app.on('window-all-closed', function () {
  trackMonitor.stop()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
