#!/usr/bin/env bash

# setup env
export NODE_ENV=development
export DB=pg
export DB_USER=postgres
export DB_HOST=localhost
export DB_PORT=5439
export DB_NAME=postgres
export DB_SCHEMA=public
export DB_PASSWORD=Pg2018@Gago.
export REDIS_HOST=127.0.0.1
export LOGIN_URL=https://api.gagogroup.cn/api/v4/login
export LOGIN_USERNAME=wuenping
export LOGIN_PASSWORD=wuenping
export DEPLOY_DOMAIN=http://localhost:3000
export MACHINE_URL=http://58.213.150.66:12002

# start
tsc
node ./dist/index.js