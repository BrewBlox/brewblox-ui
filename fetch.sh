#! /bin/bash
set -ex

curl \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  http://localhost:9000/victoria/api/v1/query_range \
  -w "\n" \
  -d 'query=avg_over_time({__name__="tilt/Pink/Specific gravity"}[1m])&step=1m' \
  | jq '(.data.result[]? | .values[]? | .[0] // empty ) |= todate' \
  > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/query \
#   -w "\n" \
#   -d 'query=avg_over_time({__name__="tilt/Pink/Specific gravity"}[10s])[1m]&step=10s&time=2021-07-01T21:59:37.309Z' \
#   | jq '(.data.result[]? | .values[]? | .[0] // empty ) |= todate' \
#   > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/query \
#   -w "\n" \
#   -d 'query=vector({__name__!=""}[1m])&time=' \
#   | jq . \
#   > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/query \
#   -w "\n" \
#   -d 'query={__name__="spock/actuator-1/value"}' \
#   | jq . \
#   > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/series \
#   -w "\n" \
#   -d 'match[]={__name__!=""}&start=10h&end=' \
#   | jq . \
#   > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/json' \
#   http://localhost:9000/history/timeseries/ranges \
#   -w "\n" \
#   -d '{
#         "fields": [
#           "sparkey/HERMS MT Sensor/value[degC]",
#           "spock/WiFiSettings/signal"
#         ],
#         "start": "2021-07-02T10:34:21.627Z",
#         "end": "2021-07-02T12:40:21.627Z"
#       }' \
#   | jq '(.[] | .values[] | .[0] // empty ) |= todate' \
#   > output.json

# curl \
#   -X GET \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/label/__name__/values \
#   -w "\n" \
#   -d 'start=1624981107606' \
#   | jq . \
#   > output.json
