#! /usr/bin/env bash

mkdir -p dev/traefik

BASE="dev/traefik/brewblox"
KEY="${BASE}.key"
CERT="${BASE}.crt"

if [ ! -f $CERT ]; then
  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $KEY -out $CERT
  sudo chown $USER $KEY $CERT
  sudo chmod 644 $CERT
  sudo chmod 600 $KEY
fi
