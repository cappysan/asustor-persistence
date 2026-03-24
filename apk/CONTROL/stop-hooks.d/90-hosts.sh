#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
. ${APKG_PKG_DIR}/env


logger "[${WHAT}] Restoring /etc/hosts..."
if test -f /etc/hosts.orig; then
  mv -f /etc/hosts.orig /etc/hosts
  chown root:root /etc/hosts
fi
