#!/usr/bin/env bash
# read -p "Current VERSION is ? (1.0.3):" VERSION
VERSION="1.1.5"

# build image from docker file
docker build --no-cache -t harbor.gagogroup.cn/agri/agri3-lands:${VERSION} .

# push them
docker push harbor.gagogroup.cn/agri/agri3-lands:${VERSION}
#docker push harbor.gagogroup.cn/api/huazhongnongji-server:latest