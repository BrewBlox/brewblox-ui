#! /usr/bin/env bash

if [ ! -f "app/traefik/brewblox.crt" ]; then
  echo "Certificate not found. Creating a new one...";
  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout app/traefik/brewblox.key -out app/traefik/brewblox.crt
  sudo chmod 644 app/traefik/brewblox.crt
  sudo chmod 600 app/traefik/brewblox.key
fi
