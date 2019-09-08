#!/usr/bin/env bash

tsc

export NODE_ENV=development
export DB=pg
export DB_USER=postgres
export DB_HOST=localhost
export DB_PORT=5435
export DB_NAME=auth
export DB_SCHEMA=public
export DB_PASSWORD=postgres
export REDIS_HOST=127.0.0.1
export AUTHOR_SERVICE_HOST=localhost
export AUTHOR_SERVICE_PORT=3000
export DEMO_AUTH_HOST=http://api.beta.gagogroup.cn
export REDIS_HOST=127.0.0.1

node dist/index.js