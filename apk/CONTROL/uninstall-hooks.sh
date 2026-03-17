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
if test -f /etc/docker/daemon.json.orig; then
  mv -f /etc/docker/daemon.json.orig /etc/docker/daemon.json
  chown root:root /etc/docker/daemon.json
  # Do not always reload since it's slow, and if we compare last
  # configuration with now, it's always going to be different
  # since we restore the original file.
  if test -f /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh; then
    # The following file exists only when docker is up and running
    if test -f /usr/local/lib/docker/cli-plugins/docker-compose; then
      if docker ps -a | grep -q ' Up '; then
        logger "[Persistence] Not reloading docker-ce because containers are running."
      else
        logger "[Persistence] Reloading docker-ce..."
        /usr/local/AppCentral/docker-ce/CONTROL/start-stop.sh reload
      fi
    fi
  fi
fi


# Hosts
# =====
logger "[Persistence] Restoring /etc/hosts..."
if test -f /etc/hosts.orig; then
  mv -f /etc/hosts.orig /etc/hosts
  chown root:root /etc/hosts
fi
