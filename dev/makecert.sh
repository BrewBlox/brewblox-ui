#! /usr/bin/env bash
set -euo pipefail
pushd "$(git rev-parse --show-toplevel)" >/dev/null

mkdir -p dev/traefik/
cd dev/traefik/

# The CA is valid for 100 years, but leaf certificates expire after two years.
# If the leaf certificate has expired, remove it so it is regenerated with the existing CA.
if [ -f minica.pem ] && [ -f brew.blox/cert.pem ]; then
  if ! docker run \
    --rm \
    --volume="$PWD":/cert \
    alpine/openssl \
    x509 \
    -in /cert/brew.blox/cert.pem \
    -noout \
    -checkend 0 >/dev/null; then
    echo "The dev certificate has expired. Generating a new one."
    rm -rf ./brew.blox/
  fi
fi

if [ ! -f minica.pem ]; then
  rm -rf ./brew.blox/
fi

if [ ! -f brew.blox/cert.pem ]; then
  # macOS does not support `hostname -I`; use `ifconfig` instead.
  if [ "$(uname -s)" = "Darwin" ]; then
    ip_addresses="127.0.0.1,$(ifconfig 2>/dev/null | awk '/inet / {print $2}' | paste -sd, -)"
  else
    ip_addresses="127.0.0.1,$(hostname -I | tr ' ' , | sed 's/,$//')"
  fi

  docker run \
    --rm \
    --user="$(id -u):$(id -g)" \
    --volume="$PWD":/cert \
    ghcr.io/brewblox/minica:develop \
    --domains="brew.blox,$(hostname),$(hostname).local,$(hostname).home,localhost" \
    --ip-addresses="$ip_addresses"
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
