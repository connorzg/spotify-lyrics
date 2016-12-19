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

install_packaging_deps_macos:
	@brew install gnu-tar graphicsmagick xz

install_packaging_deps_linux:
	@sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils