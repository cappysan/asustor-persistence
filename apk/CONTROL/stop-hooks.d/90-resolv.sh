#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
. ${APKG_PKG_DIR}/env

if test -f /etc/resolv.conf.orig; then
  logger "[${WHAT}] Restoring /etc/resolv.conf..."
  mv -f /etc/resolv.conf.orig /etc/resolv.conf
  chown root:root /etc/resolv.conf
fi
