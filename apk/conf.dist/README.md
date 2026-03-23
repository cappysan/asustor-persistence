# Files

## etc/docker/daemon.json

The file `daemon.json` in the directory will replace `/etc/docker/daemon.json` every time cappysan-persistence is started.


## etc/hosts

Every file as `/share/Configuration/cappysan-*/deps.d/persistence/hosts` will be added to `/etc/hosts`


## etc/resolv.conf

Rename `resolv.sample.conf` to `resolv.conf` and it will replace the default `/etc/resolv.conf`.
