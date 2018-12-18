#! /usr/bin/env bash

MY_DIR=$(dirname $(readlink -f $0))
source "${MY_DIR}/../.env.development"
HOST="${VUE_APP_API_URI}/datastore"

curl -s -X GET --retry 5 ${HOST}
curl -s -X PUT ${HOST}/_node/_local/_config/httpd/enable_cors -d '"true"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/origins -d '"*"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/credentials -d '"true"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'

for db in "$@"; do
  echo ${db}
  curl -s -X DELETE ${HOST}/${db}
  curl -s -X PUT ${HOST}/${db}
  cat ${MY_DIR}/presets/${db}.json \
  | curl \
    -s \
    -X POST \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --data "@-" "${HOST}/${db}/_bulk_docs"
done

echo "Done"
