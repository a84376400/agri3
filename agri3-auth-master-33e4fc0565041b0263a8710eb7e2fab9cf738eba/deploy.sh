#!/bin/bash

npm run build-ts\
 && docker build -f docker/dist.Dockerfile -t harbor.gagogroup.cn/agri/auth:$1 .\
 && docker push harbor.gagogroup.cn/agri/auth:$1\
 && echo "$1" >> deployTags.txt