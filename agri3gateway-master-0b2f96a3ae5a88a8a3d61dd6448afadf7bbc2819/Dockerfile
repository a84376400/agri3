FROM harbor.gagogroup.cn/agri/agri3-base:latest

# 设置工作目录为镜像默认的 /app 目录
WORKDIR /app

# 将当前主机路径(.)下所有文件 add 到(/app)中
ADD . /app

# Build
RUN cp -r /usr/local/src/node_modules .


# 暴露对应的端口
EXPOSE 3000

RUN chmod 777 bin/start_from_docker.sh
RUN chmod 777 bin/build.sh

RUN sh bin/build.sh


CMD ["sh", "bin/start_from_docker.sh"]