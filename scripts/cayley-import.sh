#!/bin/sh

# usage:
#   scripts/cayley-import <FILENAME>

set -e

docker-compose run --rm --entrypoint "cayley load -i /import/$1" db
