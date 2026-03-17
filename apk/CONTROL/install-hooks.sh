#!/usr/bin/env sh
#
#
. /usr/local/AppCentral/cappysan-persistence/.env.install
cd ${APKG_PKG_DIR:-/nonexistent} || exit 1

function logger() {
  echo "${@}" >&2
  syslog --log 0 --level 0 --user SYSTEM --event "${@}"
}

# Docker
# ======
# cf: https://docs.docker.com/engine/logging/drivers/json-file/
#     https://docs.docker.com/engine/logging/drivers/local/
mkdir -p /etc/docker
if test ! -f /etc/docker/daemon.json; then
  touch /etc/docker/daemon.json
fi
if test ! -f /etc/docker/daemon.json.orig; then
  cp -f /etc/docker/daemon.json /etc/docker/daemon.json.orig
fi

# Reload only if the daemon.json changed
diff -Nq /etc/docker/daemon.json ${APKG_CFG_DIR}/docker/daemon.json >/dev/null 2>&1
as_diff=$?
cp -f ${APKG_CFG_DIR}/docker/daemon.json /etc/docker/

if test "x${DOCKER_NO_RELOAD:-}" != "x"; then
  true
elif test "x${as_diff}" != "x0"; then
  if test -f /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh; then
    # The following file exists only when docker is up and running
    if test -f /usr/local/lib/docker/cli-plugins/docker-compose; then
      logger "[Persistence] Reloading docker-ce..."
      /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh reload
    fi
  fi
fi


# Hosts
# =====
logger "[Persistence] Configuring /etc/hosts..."
if test ! -f /etc/hosts.orig; then
  cp -f /etc/hosts /etc/hosts.orig
fi
cat /etc/hosts.orig > /etc/hosts
for as_file in /share/Configuration/*/hosts.d/*; do
  if test -f ${as_file}; then
    echo ""             >> /etc/hosts
    echo "# ${as_file}" >> /etc/hosts
    cat ${as_file}      >> /etc/hosts
  fi
done
