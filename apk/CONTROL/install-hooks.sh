#!/usr/bin/env sh
# SPDX-License-Identifier: MIT
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

./CONTROL/install-hooks.d/hosts.sh
./CONTROL/install-hooks.d/resolv.sh
./CONTROL/install-hooks.d/docker.sh
