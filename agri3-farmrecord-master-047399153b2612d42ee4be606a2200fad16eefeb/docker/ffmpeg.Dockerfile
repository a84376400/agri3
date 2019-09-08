FROM harbor.gagogroup.cn/agri/gagonode:v8.11.2

RUN echo "deb http://mirror.tuna.tsinghua.edu.cn/debian-multimedia/ jessie main non-free" >> /etc/apt/sources.list\
 && echo "deb-src http://mirror.tuna.tsinghua.edu.cn/debian-multimedia/ jessie main non-free" >> /etc/apt/sources.list\
 && echo "deb http://mirror.tuna.tsinghua.edu.cn/debian-multimedia/ jessie-backports main" >> /etc/apt/sources.list\
 && echo "deb-src http://mirror.tuna.tsinghua.edu.cn/debian-multimedia/ jessie-backports main" >> /etc/apt/sources.list\
 && gpg --keyserver hkp://pgp.mit.edu --recv-key 5C808C2B65558117\
 && gpg -a --export 5C808C2B65558117 | apt-key add -\
 && apt-get update && apt-get install -y --no-install-recommends deb-multimedia-keyring ffmpeg\
 && rm -rf /var/lib/apt/lists/*

CMD [ "node" ]