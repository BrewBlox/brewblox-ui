#! /usr/bin/env bash
set -euox pipefail
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

if [ ! -f minica.der ]; then
  docker run \
    --rm \
    --user="$(id -u):$(id -g)" \
    --volume="$PWD":/cert \
    alpine/openssl \
    x509 \
    -in /cert/minica.pem \
    -inform PEM \
    -out /cert/minica.der \
    -outform DER
fi

chmod +r "$PWD"/minica.pem
