#!/usr/bin/env bash
# read -p "Current VERSION is ? (1.0.3):" VERSION
VERSION="1.1.1"

# build image from docker file
docker build --no-cache -t harbor.gagogroup.cn/agri/agri3-auth:${VERSION} .

# push them
docker push harbor.gagogroup.cn/agri/agri3-auth:${VERSION}
#docker push harbor.gagogroup.cn/api/agri3-gateway:latest
