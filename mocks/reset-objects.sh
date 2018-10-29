#! /usr/bin/env bash

curl \
  --retry 5 \
  -X POST \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data "@-" "$1/reset_objects" \
  > /dev/null
