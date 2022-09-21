#! /usr/bin/env bash
set -euo pipefail
pushd "$(git rev-parse --show-toplevel)" >/dev/null

mkdir -p dev/traefik/
cd dev/traefik/

if [ ! -f brewblox.key ]; then
  docker run --rm -v "$PWD/":/certs/ brewblox/omgwtfssl:develop
  sudo chown "$USER" brewblox.key brewblox.crt
  sudo chmod 644 brewblox.crt
  sudo chmod 600 brewblox.key
fi
