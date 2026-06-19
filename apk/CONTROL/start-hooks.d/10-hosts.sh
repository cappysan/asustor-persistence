#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
. ${APKG_PKG_DIR}/env


logger "[${WHAT}] Configuring /etc/hosts..."
# Make a backup that will serve as header
if test ! -f /etc/hosts.orig; then
  cp -f /etc/hosts /etc/hosts.orig
fi

# Concat all files together
cat /etc/hosts.orig > /etc/hosts
cat /share/Configuration/persistence/etc/hosts >> /etc/hosts
