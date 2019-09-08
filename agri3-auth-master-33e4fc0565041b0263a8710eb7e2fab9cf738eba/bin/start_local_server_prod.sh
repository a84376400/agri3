#!/usr/bin/env bash

tsc

export NODE_ENV=development
export DB=pg
export DB_USER=postgres
export DB_HOST=localhost
export DB_PORT=5440
export DB_NAME=postgres
export DB_SCHEMA=public
export DB_PASSWORD=Pg2018@Gago.
export REDIS_HOST=127.0.0.1
export AUTHOR_SERVICE_HOST=localhost
export AUTHOR_SERVICE_PORT=3000
export DEMO_AUTH_HOST=https://api.gagogroup.cn

node dist/index.js