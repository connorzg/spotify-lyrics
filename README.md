![](https://raw.githubusercontent.com/dieb/spotify-lyrics/master/docs/logo.png)

[![Build Status](https://travis-ci.org/dieb/spotify-lyrics.svg?branch=master)](https://travis-ci.org/dieb/spotify-lyrics)
[![Build status](https://ci.appveyor.com/api/projects/status/mpo2ekyyeqxvo59b?svg=true)](https://ci.appveyor.com/project/dieb/spotify-lyrics)
[![Downloads](https://img.shields.io/github/downloads/dieb/spotify-lyrics/latest/total.svg)](https://github.com/dieb/spotify-lyrics/releases/latest)
[![GitHub release](https://img.shields.io/github/release/dieb/spotify-lyrics.svg)](https://github.com/dieb/spotify-lyrics/releases/latest)
[![Dependencies](https://img.shields.io/david/dieb/spotify-lyrics.svg)]()

Lyrics companion desktop app for Spotify. Currently supports macOS and Linux.


## Installation

[Download the latest release!](https://github.com/dieb/spotify-lyrics/releases/latest)


## How to use

Open `Lyrics for Spotify` alongside with Spotify.


## Screenshots

Click to view.

[![screenshot1](https://raw.githubusercontent.com/dieb/spotify-lyrics/master/docs/screenshot1-th.png)](https://raw.githubusercontent.com/dieb/spotify-lyrics/master/docs/screenshot1.png)
[![screenshot2](https://raw.githubusercontent.com/dieb/spotify-lyrics/master/docs/screenshot2-th.png)](https://raw.githubusercontent.com/dieb/spotify-lyrics/master/docs/screenshot2.png)


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m "Add some feature"`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request  :)

If you want to help, feel free to browse our [Issues](../../issues) and [PRs](../../pulls).


### Development

1. `npm install` should install everything you need
2. Run `npm run dev` in a terminal window and leave it open (webpack builder)
3. Run `npm run app` in another terminal window. This should bring up the app window
4. Opening Chrome's devTools should work with the usual hotkey. If it doesn't, you can either open it through the menu `View -> Toggle Developer Tools` or change `app/index.js` to open it up
5. (macOS) you'll need to `make build` to compile the required applescripts


## History

For detailed changelogs, see [Releases](../../releases).

## License

This project is merely an experiment for educational purposes. It's sole intent is to explore building desktop apps with Electron and make use of Spotify's AppleScript API and dbus messages. This project's code is in the public domain.

Use it at your own risk. This project does not endorse nor support any inappropriate use of lyrics as they are subject to copyright law. Lyrics are provided by ChartLyrics.com whose license is free for non-commercial use.
