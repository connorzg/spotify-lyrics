all:

clean:
	rm -rf dist app/dist

build:
	make -C app/track-monitors/macos build

install_packaging_deps_macos:
	brew install gnu-tar graphicsmagick xz

install_packaging_deps_linux:
	sudo apt-get install --no-install-recommends -y icnsutils graphicsmagick xz-utils

.PHONY: build
