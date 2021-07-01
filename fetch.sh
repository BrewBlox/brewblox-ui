#! /bin/bash
set -ex

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/query_range \
#   -w "\n" \
#   -d 'query=avg_over_time({__name__="tilt/Pink/Specific gravity"}[1m:10s])' \
#   | jq . \
#   > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/query \
#   -w "\n" \
#   -d 'query=avg_over_time({__name__="tilt/Pink/Specific gravity"}[10s])[1m]&step=10s&time=' \
#   | jq . \
#   > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/query \
#   -w "\n" \
#   -d 'query=vector({__name__!=""}[1m])&time=' \
#   | jq . \
#   > output.json

curl \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  http://localhost:9000/victoria/api/v1/query \
  -w "\n" \
  -d 'query={__name__="spock/actuator-1/value"}' \
  | jq . \
  > output.json

# curl \
#   -X POST \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/series \
#   -w "\n" \
#   -d 'match[]={__name__!=""}&start=10h&end=' \
#   | jq . \
#   > output.json

# brewblox-ctl http post \
#   http://localhost:9000/history/tsdb/ranges \
#   -d '{
#         "fields": [
#           "sparkey/HERMS MT Sensor/value[degC]",
#           "spock/WiFiSettings/signal"
#         ],
#         "duration": "10s",
#         "start": "2021-06-29T15:49:06.825Z"
#       }' \
#   | jq . \
#   > output.json

# curl \
#   -X GET \
#   -H 'Content-Type: application/x-www-form-urlencoded' \
#   http://localhost:9000/victoria/api/v1/label/__name__/values \
#   -w "\n" \
#   -d 'start=1624981107606' \
#   | jq . \
#   > output.json
