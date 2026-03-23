#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
. ${APKG_PKG_DIR}/env

export HOME=/share/Configuration/persistence
case $1 in
  start)
    logger "[Persistence] Activating user configuration..."
    touch "${APKG_PKG_DIR}/active"
    ./CONTROL/start.sh
    ;;

  stop)
    logger "[Persistence] Removing user configuration..."
    rm -f "${APKG_PKG_DIR}/active"
    ./CONTROL/stop.sh
    ;;

  restart)
    # Do not switch files off/on in sequence, just do it once.
    # Otherwise it'll restart docker every time
    ./CONTROL/start-stop.sh start
    ;;

  reload)
    # Do not switch files off/on in sequence, just do it once.
    # Otherwise it'll restart docker every time
    if test -f "${APKG_PKG_DIR}/active"; then
      ./CONTROL/start.sh
    else
      logger "[Persistence] Service is stopped, cannot reload."
    fi
    ;;

  *)
    echo "usage: $0 {start|stop|restart|reload}"
    exit 1
    ;;
esac

exit 0
