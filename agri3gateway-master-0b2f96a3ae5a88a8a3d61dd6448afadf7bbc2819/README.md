# 三合一 微服务 网关

主要使用  http  proxy  反向代理其他微服务

其他微服务的地址 使用  环境变量传入

## Setup

可以直接用 docker-compose-all.yml， 所有服务启动后，会自动 migration，数据库和 redis 部分可以直接找运维帮忙

## Services

### Gateway

会把所有服务都转发到其他服务上，有部分特殊逻辑会是在这里出来，例如 login 后的 token 管理

### Auth

主要负责用户和部门相关 api，为了应急，当初有先把天气服务放在这里，其实这个应该和三合一无关

### Land

主要负责地块服务，depend on @gago/mvt-service

### Farm Record

主要负责农事相关功能

## Document

在每个 module 下 src/docs 会有 xxx.ts，可以通过 @gago/sakura-cli 来产生文档

## Auth

通过 login 后，header 会被多带上些东西，并且存在 gateway 的 redis，返回给客户时 header 会清除掉

### x-auth-department-id
用户有权限的所有部门

### x-auth-has-user-department-id 
三合一有的功能是只显示有用户的部门

### x-auth-relation
把部门间的关系给带上了，会是长成 parent:child,parent:child ，parent 有可能为空

### x-auth-current-department
用户直属部门

### x-auth-display-name
用户显示名称，目前会是使用 base64 encode，可以改成 hex

### x-auth-role
admin 或 user，当为 admin 时，auth 服务会返回所有部门


### 相关 header 

```js
export const AUTHORITY_HEADERS_USER_ID: string = "x-auth-user-id";
export const AUTHORITY_HEADERS_ENTERPRISE_ID: string = "x-auth-enterprise-id";
export const AUTHORITY_HEADERS_DEPARTMENT_ID: string = "x-auth-department-id";
export const AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID: string = "x-auth-has-user-department-id";
export const AUTHORITY_HEADERS_TYPE: string = "x-auth-type";
export const AUTHORITY_HEADERS_TOKEN: string = "x-auth-token";
export const AUTHORITY_HEADERS_USER_NAME: string = "x-auth-user-name";
export const AUTHORITY_HEADERS_DISPLAY_NAME: string = "x-auth-display-name";
export const AUTHORITY_HEADERS_CURRENT_DEPARTMENT: string = "x-auth-current-department";
export const AUTHORITY_HEADERS_ROLE: string = "x-auth-role";
export const AUTHORITY_HEADERS_RELATION: string = "x-auth-relation";
export const AUTHORITY_HEADERS: string[] = [ AUTHORITY_HEADERS_USER_ID, AUTHORITY_HEADERS_ENTERPRISE_ID, AUTHORITY_HEADERS_DEPARTMENT_ID, AUTHORITY_HEADERS_TYPE, AUTHORITY_HEADERS_TOKEN, AUTHORITY_HEADERS_USER_NAME, AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID, AUTHORITY_HEADERS_CURRENT_DEPARTMENT, AUTHORITY_HEADERS_ROLE, AUTHORITY_HEADERS_DISPLAY_NAME, AUTHORITY_HEADERS_RELATION ];
```

## Roadmap

1. 地块缓存太久，要的话可以改用其他 pub/sub 系统 （ effort 是项目组负担会变得更大，而且地块不多其实没太多必要缓存 ）
2. 用户认证的时候，会需要跨服务请求，目前没有更好的解决方法，在不增加 component 和 process 的情况下
3. spelling checking, coding style
4. 很多 api 是为了单一个 client 而开出来的，没有太多意义
5. 气象 api 现在是放在 auth 服务，原因是这个应该是底层 API 支持才是
6. alarm api 也是底层 api 需要支持，现在是先 work around
7. gateway 用户 display name 改成 hex
8. docker image 部分可以和薛金梁拿脚本，取代需要自己写版本
9. 服务可以用共用 lib, 不然其实很多重复性的代码
10. no any comment
11. auth 服务名字很奇怪，伟哥当初就叫这个了
12. 地块有偏无偏目前没有任何工具可以协助项目组转换，导入 geojson 会很痛苦，需要有个工具 ( 之前开会拍板是三合一提供工具 )
13. 改了认证机制后，用户需要重新 login，一样是需要工具
14. 还缺了用户要在 root 新增部门的功能
15. bug tags 的 bug
16. docker-compose 可以用 .env
17. 有的服务过不了佳格大法官
18. 现在 gateway 的 port 是 3001 mapping 到 3010，应该是恩平当初为了方便测试
19. 农事记录 picture 当初不知道为啥没有用 json
20. sakura-node-3 不支持 jsonb 类型，所有的数据库类型 json 目前都需要手动修改成 jsonb，jsonb 有很多方便的 function ( auth )
21. 其实不太建议共用 redis 和数据库，不然很容易不小心就会影响到其他服务 ( 目前数据库是分库的状态，但 redis 没分 )
22. 地块列表会返回整个 geojson ，会造成传输很慢，但前端确实需要，可以再看下是不是可以通过 pb 直接获取
23. 目前有的地方有用到彩云 api，记得要去掉，不然 token 满天飞
24. demo 系统目前没有限制任何企业，只要是 gago user 就好，但实际上是不是换成 admin 比较好，旧的用户系统没太多存在意义