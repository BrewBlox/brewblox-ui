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
proto_sha=$(awk -F "=" '/proto_sha/ {print $2}' ./firmware.ini)

echo "Updating to firmware release ${firmware_date}-${firmware_version}"

# The shared types are a git submodule, linked into node_modules by yarn.
# Checking out the matching commit is all that is needed.
git submodule update --init brewblox-proto
git -C brewblox-proto fetch --quiet origin
git -C brewblox-proto checkout --quiet "${proto_sha}"

echo "brewblox-proto is now at ${proto_sha}"
echo "Commit firmware.ini and the brewblox-proto submodule to pin this release."
