#! /usr/bin/env bash
set -e

pushd "$(dirname "$(readlink -f "$0")")" > /dev/null
mkdir -p traefik/
cd traefik/

if [ ! -f brewblox.key ]; then

  docker run \
    -v "$(pwd)/":/certs/ \
    -e SSL_SUBJECT=localhost \
    -e SSL_KEY=brewblox.key \
    -e SSL_CERT=brewblox.crt \
    -e SSL_EXPIRE=365 \
    -e SSL_DNS=localhost \
    -e SILENT=true \
    paulczar/omgwtfssl

  sudo chown "$USER" brewblox.key brewblox.crt
  sudo chmod 644 brewblox.crt
  sudo chmod 600 brewblox.key

fi

popd > /dev/null
