module.exports = function() {
  const {Menu, shell} = require('electron')
  const package = require('../package.json')

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
            shell.openExternal(package.repository)
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

  return Menu.buildFromTemplate(template)
}
