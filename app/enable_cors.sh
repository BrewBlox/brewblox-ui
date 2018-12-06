#! /usr/bin/env bash

MY_DIR=$(dirname $(readlink -f $0))
source "${MY_DIR}/../.env.development"
HOST="${VUE_APP_API_URI}/couchstore"

curl -s -X GET --retry 5 ${HOST}
curl -s -X PUT ${HOST}/_node/_local/_config/httpd/enable_cors -d '"true"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/origins -d '"*"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/credentials -d '"true"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'
curl -s -X PUT ${HOST}/_node/_local/_config/cors/headers -d '"accept, authorization, content-type, origin, referer, x-csrf-token"'
