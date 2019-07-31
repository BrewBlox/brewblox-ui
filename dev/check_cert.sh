#! /usr/bin/env bash

mkdir -p dev/traefik

BASE="dev/traefik/brewblox"
KEY="${BASE}.key"
CSR="${BASE}.csr"
RSA_KEY="${BASE}.rsa.key"
CERT="${BASE}.crt"
CA="${BASE}.ca"

# if [ ! -f $CERT ]; then
  echo "Certificate not found. Creating a new one...";
  sudo openssl genrsa -out $KEY
  sudo openssl req -new -sha256 -key $KEY -out $CSR
  sudo openssl x509 -req -in $CSR -signkey $KEY -out $CERT


  # sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $KEY -out $CERT
  # sudo openssl rsa -in $KEY -out $RSA_KEY
  sudo chown $USER $KEY $CERT
  sudo chmod 644 $CERT
  sudo chmod 600 $KEY
  # cat $RSA_KEY > $CA
  # cat $CERT >> $CA
# fi
