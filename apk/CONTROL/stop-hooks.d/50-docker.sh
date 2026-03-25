#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
. ${APKG_PKG_DIR}/env


# Docker
# ======
if test ! -f /etc/docker/daemon.json.orig; then
  exit 0
fi
if test ! -f /etc/docker/daemon.json; then
  exit 0
fi

if diff -abq /etc/docker/daemon.json.orig /etc/docker/daemon.json >/dev/null; then
  # Files are the same.
  logger "[${WHAT}] Not reloading docker-ce, no configuration change."
  mv -f /etc/docker/daemon.json.orig /etc/docker/daemon.json
  chown root:root /etc/docker/daemon.json
  exit 0
fi

mv -f /etc/docker/daemon.json.orig /etc/docker/daemon.json
chown root:root /etc/docker/daemon.json

if test ! -f /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh; then
  logger "[${WHAT}] Not reloading docker-ce, docker-ce not installed."
  exit 0
fi

if test "$x{DOCKER_RELOAD}" == "x0"; then
  logger "[${WHAT}] Not reloading docker-ce, DOCKER_RELOAD is set to false."
  exit 0
fi

# The following file exists only when docker is up and running
if test -f /usr/local/lib/docker/cli-plugins/docker-compose; then
  logger "[${WHAT}] Reloading docker-ce..."
  /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh reload
else
  logger "[${WHAT}] Not reloading docker-ce, docker-ce not running."
fi
