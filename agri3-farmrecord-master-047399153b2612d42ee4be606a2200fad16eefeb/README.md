# 三合一田间记录微服务

- `harbor.gagogroup.cn/agri/farmrecord:node_modules` 基础依赖包，package.json变更时需要重新`build`,对应`Dockerfile`为`docker/nodeModule.Dockerfile`
- `harbor.gagogroup.cn/agri/farmrecord:x.x` 服务主程序包,对应`Dockerfile`为`docker/dist.Dockerfile`,快速发布脚本为`deploy.sh`,使用方法:`./deploy.sh x.x`