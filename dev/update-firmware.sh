#! /usr/bin/env bash
set -euo pipefail
pushd "$(git rev-parse --show-toplevel)" >/dev/null

# Args
# Release can be either firmware branch name,
# or "${firmware_date}-${firmware_version}" format
RELEASE=${1:-"develop"}

# Download ini file from Azure
curl -sSf \
  -o ./firmware.ini \
  "https://brewblox.blob.core.windows.net/firmware/${RELEASE}/firmware.ini"

# Extract variables from ini
firmware_date=$(awk -F "=" '/firmware_date/ {print $2}' ./firmware.ini)
firmware_version=$(awk -F "=" '/firmware_version/ {print $2}' ./firmware.ini)
proto_version=$(awk -F "=" '/proto_version/ {print $2}' ./firmware.ini)

echo "Updating to firmware release ${firmware_date}-${firmware_version}"

yarn add "https://github.com/brewblox/brewblox-proto#${proto_version}"
