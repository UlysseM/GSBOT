#!/bin/sh

echo 'Starting GSBot'
command -v node >/dev/null 2>&1 || { echo >&2 "nodejs needs to be installed and in the path.  Aborting."; exit 1; }
node core/reconfigure.js
