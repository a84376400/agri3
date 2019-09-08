FROM harbor.gagogroup.cn/agri/farmrecord:node_modules

COPY dist/ /usr/src/app/
WORKDIR /usr/src/app

EXPOSE 3000

CMD [ "pm2-docker" , "start", "index.js", "-i", "0"]