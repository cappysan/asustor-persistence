#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#

. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

export HOME=/share/Configuration/persistence
case $1 in
  start)
    logger "[Persistence] Activating user configuration..."
    touch "${APKG_CFG_DIR}/active"
    ./CONTROL/start.sh
    ;;

  stop)
    logger "[Persistence] Removing user configuration..."
    rm -f "${APKG_CFG_DIR}/active"
    ./CONTROL/stop.sh
    ;;

  restart)
    # Do not switch files off/on in sequence, just do it once.
    ./CONTROL/start-stop.sh start
    ;;

  reload)
    # Do not switch files off/on in sequence, just do it once.
    if test -f "${APKG_CFG_DIR}/active"; then
      export DOCKER_NO_RELOAD=1
      ./CONTROL/start.sh
    else
      logger "[Persistence] Service is not up, cannot reload."
    fi
    ;;

  *)
    echo "usage: $0 {start|stop|restart|reload}"
    exit 1
    ;;

esac
exit 0
