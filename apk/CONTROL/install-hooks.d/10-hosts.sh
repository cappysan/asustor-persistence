#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

logger "[Persistence] Configuring /etc/hosts..."
if test ! -f /etc/hosts.orig; then
  cp -f /etc/hosts /etc/hosts.orig
fi
cat /etc/hosts.orig > /etc/hosts
for as_file in /share/Configuration/*/persist.d/etc/hosts; do
  if test -f ${as_file}; then
    echo ""                 >> /etc/hosts
    echo "# cf: ${as_file}" >> /etc/hosts
    cat ${as_file}          >> /etc/hosts
  fi
done
