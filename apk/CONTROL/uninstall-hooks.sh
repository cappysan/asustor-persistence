#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

./CONTROL/uninstall-hooks.d/docker.sh
./CONTROL/uninstall-hooks.d/resolv.sh
./CONTROL/uninstall-hooks.d/hosts.sh
