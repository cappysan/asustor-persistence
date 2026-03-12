#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#

. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1


function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

# cf: apk/bin/install-hooks
export HOME=/share/Configuration/apache
case $1 in
  start)
    touch "${APKG_CFG_DIR}/active"
    ${APKG_PKG_DIR}/bin/install-hooks
    logger "[Persistence] Configuring files..."
    ;;

  stop)
    rm -f "${APKG_CFG_DIR}/active"
    logger "[Persistence] Uninstallation: Not implemented."
    ;;

  restart)
    ./CONTROL/start-stop.sh stop
    ./CONTROL/start-stop.sh start
    ;;

  reload)
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
