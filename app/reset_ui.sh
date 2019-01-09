#! /usr/bin/env bash

MY_DIR=$(dirname $(readlink -f $0))
source "${MY_DIR}/../.env.development"
HOST="${VUE_APP_API_URI}/datastore"

curl -sk -X GET --retry 5 ${HOST}
curl -sk -X PUT ${HOST}/_node/_local/_config/httpd/enable_cors -d '"true"'
curl -sk -X PUT ${HOST}/_node/_local/_config/cors/origins -d '"*"'
curl -sk -X PUT ${HOST}/_node/_local/_config/cors/credentials -d '"true"'
curl -sk -X PUT ${HOST}/_node/_local/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
curl -sk -X PUT ${HOST}/_node/_local/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'

for db in "$@"; do
  echo ${db}
  curl -sk -X DELETE ${HOST}/${db}
  curl -sk -X PUT ${HOST}/${db}
  cat ${MY_DIR}/presets/${db}.json \
  | curl \
    -sk \
    -X POST \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --data "@-" "${HOST}/${db}/_bulk_docs"
done

echo "Done"
