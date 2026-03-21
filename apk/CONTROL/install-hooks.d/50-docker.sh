#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

# Docker
# ======
# cf: https://docs.docker.com/engine/logging/drivers/json-file/
#     https://docs.docker.com/engine/logging/drivers/local/
#
if test ! -f ${APKG_CFG_DIR}/persist.d/etc/docker/daemon.json; then
  exit 0
fi

mkdir -p /etc/docker
# Create an empty file so that we don't backup the persist.d version
touch /etc/docker/daemon.json
if test ! -f /etc/docker/daemon.json.orig; then
  cp -f /etc/docker/daemon.json /etc/docker/daemon.json.orig
fi
if diff -abq ${APKG_CFG_DIR}/persist.d/etc/docker/daemon.json /etc/docker/daemon.json >/dev/null; then
  # Files are the same.
  chown root:root /etc/docker/daemon.json
else
  cp -f ${APKG_CFG_DIR}/persist.d/etc/docker/daemon.json /etc/docker/daemon.json
  chown root:root /etc/docker/daemon.json

  if test -f /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh; then
    # The following file exists only when docker is up and running
    if test -f /usr/local/lib/docker/cli-plugins/docker-compose; then
      logger "[Persistence] Reloading docker-ce..."
      /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh reload
    fi
  fi
fi
