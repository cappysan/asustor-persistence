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
mkdir -p /etc/docker
if test ! -f /etc/docker/daemon.json; then
  touch /etc/docker/daemon.json
fi
if test ! -f /etc/docker/daemon.json.orig; then
  cp -f /etc/docker/daemon.json /etc/docker/daemon.json.orig
fi

# Reload only if the daemon.json changed
diff -Nq /etc/docker/daemon.json ${APKG_CFG_DIR}/persist.d/etc/docker/daemon.json >/dev/null 2>&1
as_diff=$?
cp -f ${APKG_CFG_DIR}/persist.d/etc/docker/daemon.json /etc/docker/

if test "x${DOCKER_NO_RELOAD:-}" != "x"; then
  logger "[Persistence] DOCKER_NO_RELOAD is set, not reloading docker-ce"
elif test "x${as_diff}" != "x0"; then
  if test -f /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh; then
    # The following file exists only when docker is up and running
    if test -f /usr/local/lib/docker/cli-plugins/docker-compose; then
      logger "[Persistence] Reloading docker-ce..."
      /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh reload
    fi
  fi
fi
