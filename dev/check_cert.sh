#! /usr/bin/env bash
set -e

mkdir -p dev/traefik
pushd dev/traefik > /dev/null

if [ ! -f brewblox.cnf ]; then

  # Chrome > 58 requires a subject alt name for the cert
  cat /usr/lib/ssl/openssl.cnf > brewblox.cnf
  printf '\n[SAN]\nsubjectAltName=DNS:localhost' >> brewblox.cnf

  sudo openssl req \
    -newkey rsa:2048 \
    -x509 \
    -nodes \
    -keyout brewblox.key \
    -new \
    -out brewblox.crt \
    -subj /CN=localhost \
    -reqexts SAN \
    -extensions SAN \
    -config brewblox.cnf \
    -sha256 \
    -days 3650

  sudo chown $USER brewblox.key brewblox.crt brewblox.cnf
  sudo chmod 644 brewblox.crt
  sudo chmod 600 brewblox.key
fi

popd > /dev/null
