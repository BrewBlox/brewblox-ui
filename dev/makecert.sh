#! /usr/bin/env bash
set -euo pipefail
pushd "$(git rev-parse --show-toplevel)" >/dev/null

mkdir -p dev/traefik/
cd dev/traefik/

if [ ! -f minica.pem ]; then
  rm -rf ./brew.blox/
  docker run \
    --rm \
    --user="$(id -u):$(id -g)" \
    --volume="$PWD":/cert \
    ghcr.io/brewblox/minica:develop \
    --domains="brew.blox,$(hostname),$(hostname).local,$(hostname).home,localhost" \
    --ip-addresses="127.0.0.1,$(hostname -I | tr ' ' , | sed 's/,$//')"
fi

chmod +r "$PWD"/minica.pem
