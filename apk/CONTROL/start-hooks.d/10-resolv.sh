#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
. ${APKG_PKG_DIR}/env


# Resolv.conf
# ===========
logger "[Persistence] Configuring /etc/resolv.conf..."
if test -f ${APKG_CFG_DIR}/etc/resolv.conf; then
  if test ! -f /etc/resolv.conf.orig; then
    cp -f /etc/resolv.conf /etc/resolv.conf.orig
  fi
  cp ${APKG_CFG_DIR}/etc/resolv.conf /etc/resolv.conf
  chown root:root /etc/resolv.conf
fi
