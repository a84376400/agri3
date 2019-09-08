#!/bin/bash

npm run build\
 && docker build -f docker/dist.Dockerfile -t harbor.gagogroup.cn/agri/land:$1 .\
 && docker push harbor.gagogroup.cn/agri/land:$1\
 && echo "$1" >> deployTags.txt