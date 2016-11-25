SPOTIFY_SCPT_SOURCES = $(wildcard control/*.applescript)

define compile_applescript
	osacompile -o $(1) $(2)
endef

all: clean spotify_applescript run_server
	@echo "Done!"

spotify_applescript:
	@echo "Compiling Spotify control scripts..."
	-@for source in $(SPOTIFY_SCPT_SOURCES) ; do \
		$(call compile_applescript,$${source%applescript}scpt,$$source); \
	done

run_server:
	@printf "Running lyrics server...\n"
	@python server.py

clean:
	@find . -name *.scpt -delete
	@find . -name *.pyc -delete
