tell application "Spotify"
    set trackId to id of current track as string
    do shell script "echo " & quoted form of trackId
end tell
