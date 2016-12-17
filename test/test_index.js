const path = require('path')
const Application = require('spectron').Application
const assert = require('assert')

describe('application launch', function () {
  this.timeout(10000)

  beforeEach(function () {
    let pathToBinary;

    switch (process.platform) {
      case 'linux':
        pathToBinary = path.join(__dirname, '../dist/linux-unpacked/lyrics-for-spotify');
        break;

      case 'darwin':
        pathToBinary = path.join(__dirname, '../dist/mac/Lyrics\ for\ Spotify.app/Contents/MacOS/Lyrics\ for\ Spotify');
        break;

      case 'win32':
        pathToBinary = path.join(__dirname, '../dist/win-unpacked/Lyrics for Spotify.exe');
        break;

      default:
        throw new Error('Path to the built binary needs to be defined for this platform in test/index.js');
    }

    this.app = new Application({
      path: pathToBinary
    })

    return this.app.start()
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
    })
  })
})
