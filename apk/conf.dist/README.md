# Files

## etc/docker/daemon.json

The file `daemon.json` in this directory will replace `/etc/docker/daemon.json` every time the cappysan-persistence app is started.


## etc/hosts

Every host file as `/share/Configuration/*/persist.d/etc/hosts` will be added to `/etc/hosts`


## etc/resolv.conf

Rename `resolv.sample.conf` to `resolv.conf` and it will replace the default `/etc/resolv.conf`.
