#!/bin/bash

npm run build-ts\
 && docker build -f docker/dist.Dockerfile -t harbor.gagogroup.cn/agri/gateway:$1 .\
 && docker push harbor.gagogroup.cn/agri/gateway:$1\
 && echo "$1" >> deployTags.txt