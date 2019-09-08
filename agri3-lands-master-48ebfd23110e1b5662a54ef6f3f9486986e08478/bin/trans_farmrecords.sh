#!/usr/bin/env bash

# setup env
export NODE_ENV=development
export DB=pg
export DB_USER=postgres
export DB_HOST=localhost
export DB_PORT=5435
export DB_NAME=lands
export DB_SCHEMA=public
export DB_PASSWORD=postgres
export REDIS_HOST=127.0.0.1
export AUTHOR_SERVICE_HOST=localhost
export AUTHOR_SERVICE_PORT=3000

# start
tsc
node ./dist/tools/transfarmrecords.js