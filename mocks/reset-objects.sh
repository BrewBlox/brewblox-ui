#! /usr/bin/env bash

MY_DIR=$(dirname $(readlink -f $0))
source "${MY_DIR}/../.env.development"

cat $1 | curl \
  --retry 5 \
  -X POST \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data "@-" "${VUE_APP_API_URI}/$2/reset_objects" \
  > /dev/null
