# Lyrics for Spotify (macOS)

(EXPERIMENTAL)

Lyrics for Spotify, macOS Only.

Taps into Spotify to get what's currently playing and delivers the lyrics to a tab on your browser.

Implemented in pure python, no dependencies required.


## Running

Run on a command-line:

```
$ make
Compiling Spotify control scripts...
Running lyrics server...
Lyrics hosted locally at http://0.0.0.0:8000
```

Point your browser to `http://0.0.0.0:8000` and it should automatically update
with the current track you're listening to on Spotify.


## Other info

- Browser tab updates every 5 secs (configurable on app.html)
- Lyrics from [ChartLyrics](http://www.chartlyrics.com/)

