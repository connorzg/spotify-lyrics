const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const spawn = require('child_process').spawn;

let mainWindow
let serverProcess

function createBackend () {
  serverProcess = spawn('make')

  serverProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  serverProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`)
  })

  serverProcess.on('close', (code) => {
    console.log(`Server died with code ${code}`)
    serverProcess = null
  })

  console.log(`Spawned child pid: ${serverProcess.pid}`);
}

function killBackend () {
  serverProcess.kill('SIGHUP')
}

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', function () {
  createBackend()
  createWindow()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
    killBackend()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
