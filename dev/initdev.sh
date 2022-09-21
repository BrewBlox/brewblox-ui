#! /usr/bin/env bash
set -euo pipefail
pushd "$(git rev-parse --show-toplevel)" >/dev/null

if [ -f dev/.env ]; then
  export "$(grep -v '^#' .env | xargs | envsubst)"
fi

set +u
XDG_CACHE_HOME="${XDG_CACHE_HOME:-${HOME}/.cache}"
CACHE_HOME="${BREWBLOX_CACHE_HOME:-${XDG_CACHE_HOME}}"
BREWBLOX_CACHE_DIR="${CACHE_HOME}/brewblox-ui"
set -u

# Init env file, used by docker compose
{
  echo '# WARNING'
  echo '# This file is auto-generated, and will be overwritten.'
  echo '# You can add or override values by creating a dev/.env file.'
  echo ''
  echo '# Computed values'
  echo "BREWBLOX_CACHE_DIR=${BREWBLOX_CACHE_DIR}"
} >.env

# Devs may override or set their own values
if [ -f dev/.env ]; then
  {
    echo ''
    echo '# dev/.env'
    cat dev/.env
  } >>.env
fi

# Mounted directories for development services
mkdir -p ./dist
mkdir -p "${BREWBLOX_CACHE_DIR}/node-red"
mkdir -p "${BREWBLOX_CACHE_DIR}/redis"
mkdir -p "${BREWBLOX_CACHE_DIR}/victoria"
mkdir -p "${BREWBLOX_CACHE_DIR}/simulator__sparkey"
mkdir -p "${BREWBLOX_CACHE_DIR}/simulator__spock"
mkdir -p "${BREWBLOX_CACHE_DIR}/tilt"
