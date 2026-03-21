#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

logger "[Persistence] Restoring /etc/hosts..."
if test -f /etc/hosts.orig; then
  mv -f /etc/hosts.orig /etc/hosts
  chown root:root /etc/hosts
fi
