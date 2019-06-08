#! /usr/bin/env bash

mkdir -p dev/traefik

if [ ! -f "dev/traefik/brewblox.crt" ]; then
  echo "Certificate not found. Creating a new one...";
  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout dev/traefik/brewblox.key -out dev/traefik/brewblox.crt
  sudo chmod 644 dev/traefik/brewblox.crt
  sudo chmod 600 dev/traefik/brewblox.key
fi
