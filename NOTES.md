# Notes

## Installation

- Sets permissions on `APKG_PKG_DIR`

- Sets permissions on `APKG_CFG_DIR`

- Copy, no overwrite, files from `APKG_PKG_DIR/conf.dist` to `APKG_CFG_DIR`


## Hooks

When starting / stopping the service, every script in start-hooks.d / stop-hooks.d will be run.

### Hosts

- Make a backup if needed of `/etc/hosts`

- For every file in `/share/Configuration/*/deps.d/persistence/hosts`, append to `/etc/hosts`

### Resolv

- Make a backup if needed of `/etc/resolv.conf`

- Copy `${APKG_CFG_DIR}/etc/resolv.conf` over to /etc/resolv.conf

### Docker

- Stop if docker is not installed. Tests for `/usr/local/AppCentral/docker-ce/**`

- Make a backup of `/etc/docker/daemon.json`

- Copy `${APKG_CFG_DIR}/etc/docker/daemon.json` to `/etc/docker/daemon.json`

- Reload the service if docker is running. Tests for `/usr/local/lib/docker/cli-plugins/docker-compose`
