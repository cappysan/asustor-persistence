# docker

The file `daemon.json` in this directory will replace `/etc/docker/daemon.json` every time the cappysan-persistence app is started.

The docker daemon will not be reloaded automatically since this kills the currently running containers.
