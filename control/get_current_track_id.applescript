do shell script "echo " & quoted form of getCurrentPlayingTrackId()

on getCurrentPlayingTrackId()
    tell application "Spotify"
        return id of current track as string
    end tell
end getCurrentPlayingTrackId

