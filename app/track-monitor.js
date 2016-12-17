const platform = require('os').platform()
const LinuxTrackMonitor = require('./track-monitors/linux')
const MacOSTrackMonitor = require('./track-monitors/mac-os')


switch (platform) {
  case 'linux':
    module.exports = LinuxTrackMonitor;
    break;
  case 'darwin':
    module.exports = MacOSTrackMonitor;
    break;
  default:
    console.log('Platform not supported', platform)
    break
}
