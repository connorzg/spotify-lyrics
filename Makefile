SPOTIFY_SCPT_SOURCES = $(wildcard control/*.applescript)
OS := $(shell uname)

define compile_applescript
	osacompile -o $(1) $(2)
endef

all: clean compile_spotify_applescript

build: clean compile_spotify_applescript
	@electron-packager ./ --icon assets/img/icon.icns --platform darwin --appname "Lyrics for Spotify" --app-category-type public.app-category.music --app-bundle-id "lyrics-for-spotify" --overwrite

compile_spotify_applescript:
	@echo "Compiling Spotify control scripts..."
	-@for source in $(SPOTIFY_SCPT_SOURCES) ; do \
		$(call compile_applescript,$${source%applescript}scpt,$$source); \
	done

clean:
	@find . -name *.scpt -delete
	@find . -name *.pyc -delete

