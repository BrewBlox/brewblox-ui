#! /usr/bin/env bash
set -e

pushd "$(dirname "$(readlink -f "$0")")" > /dev/null
mkdir -p traefik/
cd traefik/

if [ ! -f brewblox.key ]; then

  docker run -it --rm \
    -v "$(pwd)/":/certs/ \
    paulczar/omgwtfssl \
    openssl \
    req \
    -x509 \
    -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -subj "/C=NL/ST=./L=./O=Brewblox/OU=./CN=."  \
    -keyout brewblox.key \
    -out brewblox.crt

  sudo chown "$USER" brewblox.key brewblox.crt
  sudo chmod 644 brewblox.crt
  sudo chmod 600 brewblox.key

fi

popd > /dev/null
