#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

# Resolv.conf
# ===========
logger "[Persistence] Configuring /etc/resolv.conf..."
if test -f ${APKG_CFG_DIR}/persist.d/etc/resolv.conf; then
  if test ! -f /etc/resolv.conf.orig; then
    cp -f /etc/resolv.conf /etc/resolv.conf.orig
  fi
  cp ${APKG_CFG_DIR}/persist.d/etc/resolv.conf /etc/resolv.conf
  chown root:root /etc/resolv.conf
fi
