#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

logger "[Persistence] Restoring /etc/resolv.conf..."
if test -f /etc/resolv.conf.orig; then
  mv -f /etc/resolv.conf.orig /etc/resolv.conf
  chown root:root /etc/resolv.conf
fi
