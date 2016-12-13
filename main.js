const {app, Menu, BrowserWindow} = require('electron')

const path = require('path')
const url = require('url')
const spawn = require('child_process').spawn;
const package = require('./package.json')

const template = [
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () {
          require('electron').shell.openExternal(package.repository)
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: package.description,
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })

  // Window menu.
  template[3].submenu = [
    {label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close'},
    {label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize'},
    {label: 'Zoom', role: 'zoom'},
    {type: 'separator'},
    {label: 'Bring All to Front', role: 'front'}
  ]
}

const menu = Menu.buildFromTemplate(template)
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'assets/img/icon.png'),
    title: package.description,
    frame: false
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', function () {
  createWindow()
  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
