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

mv -f /etc/docker/daemon.json.orig /etc/docker/daemon.json
chown root:root /etc/docker/daemon.json

if test -f /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh; then
  # The following file exists only when docker is up and running
  if test -f /usr/local/lib/docker/cli-plugins/docker-compose; then
    logger "[Persistence] Reloading docker-ce..."
    /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh reload
  fi
fi
