#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
. ${APKG_PKG_DIR}/env

# Docker
# ======
# cf: https://docs.docker.com/engine/logging/drivers/json-file/
#     https://docs.docker.com/engine/logging/drivers/local/
#
if test ! -f ${APKG_CFG_DIR}/etc/docker/daemon.json; then
  exit 0
fi

if test ! -f /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh; then
  logger "[${WHAT}] Not reloading docker-ce, docker-ce not installed."
  exit 0
fi

if test ! -f ${APKG_CFG_DIR}/etc/docker/daemon.json; then
  logger "[${WHAT}] Not reloading docker-ce, replacement docker.json does not exist."
  exit 0
fi


# Create an empty file if needed so that we don't backup our own version
mkdir -p /etc/docker
touch /etc/docker/daemon.json
chown root:root /etc/docker/daemon.json

if test ! -f /etc/docker/daemon.json.orig; then
  cp -f /etc/docker/daemon.json /etc/docker/daemon.json.orig
fi

# Compare file about to be installed and current configuration,
# If it's the same, skip it
if diff -abq ${APKG_CFG_DIR}/etc/docker/daemon.json /etc/docker/daemon.json >/dev/null; then
  # Files are the same.
  logger "[${WHAT}] Not reloading docker-ce, no configuration change."
  exit 0
fi

cp -f ${APKG_CFG_DIR}/etc/docker/daemon.json /etc/docker/daemon.json
chown root:root /etc/docker/daemon.json

if test "$x{DOCKER_RELOAD}" == "x0"; then
  logger "[${WHAT}] Not reloading docker-ce, DOCKER_RELOAD is set to false."
  exit 0
fi

if dockerd --validate >/dev/null 2>&1; then
  true
else
  logger "[${WHAT}] Not reloading docker-ce, configuration is invalid."
  exit 0
fi

# The following file exists only when docker is up and running
if test -f /usr/local/lib/docker/cli-plugins/docker-compose; then
  logger "[${WHAT}] Reloading docker-ce..."
  /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh reload
else
  logger "[${WHAT}] Not reloading docker-ce, docker-ce not running."
fi
