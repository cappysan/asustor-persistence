#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
# ------------------------------------------------------------------------------
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1
if test -f ${APKG_PKG_DIR}/env; then
  . ${APKG_PKG_DIR}/env
fi

for as_file in ./CONTROL/start-hooks.d/*.sh; do
  if test -f "${as_file}"; then
    ${as_file}
  fi
done

exit 0
