# dapingtai

## Description

三合一大平台

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```



## 部署 pg
docker volume create pgdata
docker run -it  -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=111111  -d mdillon/postgis

## 部署 server
docker run -p 3001:3000 --link distracted_franklin:postgres -d harbor.gagogroup.cn/engine/enterprise-server:v0.1