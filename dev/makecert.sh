#! /usr/bin/env bash
set -e

pushd "$(dirname "$(readlink -f "$0")")" > /dev/null
mkdir -p traefik/
cd traefik/

if [ ! -f brewblox.key ]; then
  docker run --rm -v "$(pwd)/":/certs/ brewblox/omgwtfssl:develop
  sudo chown "$USER" brewblox.key brewblox.crt
  sudo chmod 644 brewblox.crt
  sudo chmod 600 brewblox.key
fi

popd > /dev/null
