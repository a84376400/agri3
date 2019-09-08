FROM harbor.gagogroup.cn/agri/gagonode:v8.11.2

RUN mkdir -p /usr/src/app
WORKDIR /usr/src
# 分别使用taobao/gago registry安装依赖包
RUN nrm use taobao\
  && npm i -g npm pm2\
  && npm i connect-timeout http-proxy-middleware\
  express redis request axios cors @types/cors\
  && nrm use gago\
  && npm i sakura-node-3\
  && npm cache clean --force

CMD [ "node" ]