#!/usr/bin/env bash

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
fi

if [[ "$TRAVIS_OS_NAME" == "darwin" ]]; then
  make build
fi

node --version
npm --version
npm run pack

npm install
npm test
