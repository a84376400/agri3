FROM harbor.gagogroup.cn/agri/gagonode:v8.11.2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src
# 分别使用taobao/gago registry安装依赖包
RUN nrm use taobao\
  && npm i -g typescript tslint@5 pm2\
  && npm i typescript body-parser@1.18 compression@1.7 connect-timeout\
  express@4 @types/connect-timeout express-validator\
  @types/body-parser@1 @types/compression\
  @types/express@4 @types/node@8\
  && nrm use gago\
  && npm i @gago/tslint-config sakura-node-3\
  && npm cache clean --force

CMD [ "node" ]