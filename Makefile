SPOTIFY_SCPT_SOURCES = $(wildcard control/*.applescript)

define compile_applescript
	osacompile -o $(1) $(2)
endef

build: clean compile_spotify_applescript

compile_spotify_applescript:
	@echo "Compiling Spotify control scripts..."
	-@for source in $(SPOTIFY_SCPT_SOURCES) ; do \
		$(call compile_applescript,$${source%applescript}scpt,$$source); \
	done

clean:
	@find . -name *.scpt -delete
