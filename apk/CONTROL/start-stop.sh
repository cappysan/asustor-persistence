#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#

. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

# cf: apk/CONTROL/install-hooks.sh
export HOME=/share/Configuration/persistence
case $1 in
  start)
    logger "[Persistence] Starting, creating user configuration..."
    touch "${APKG_CFG_DIR}/active"
    ${APKG_PKG_DIR}/CONTROL/install-hooks.sh
    ;;

  stop)
    logger "[Persistence] Stopping, removing user configuration..."
    rm -f "${APKG_CFG_DIR}/active"
    ${APKG_PKG_DIR}/CONTROL/uninstall-hooks.sh
    ;;

  restart)
    ./CONTROL/start-stop.sh stop
    ./CONTROL/start-stop.sh start
    ;;

  reload)
    logger "[Persistence] Reloading..."
    if test -f "${APKG_CFG_DIR}/active"; then
      ./CONTROL/start-stop.sh stop
      ./CONTROL/start-stop.sh start
    fi
    ;;

  *)
    echo "usage: $0 {start|stop|restart|reload}"
    exit 1
    ;;

esac
exit 0
