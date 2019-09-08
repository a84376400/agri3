import express from "express";
import { HttpResponse, haltOnTimedout, corsAllowAll, ApiDocContext } from "sakura-node-3";
import cors from "cors";
import proxy from "http-proxy-middleware";
import { tokenParser } from "./middleware/token";
import { AUTHORITY_HEADERS_USER_ID, AUTHORITY_HEADERS_ENTERPRISE_ID, AUTHORITY_HEADERS, AUTHORITY_HEADERS_DEPARTMENT_ID, AUTHORITY_HEADERS_TYPE, AUTHORITY_HEADERS_TOKEN, AUTHORITY_HEADERS_USER_NAME, AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID, AUTHORITY_HEADERS_CURRENT_DEPARTMENT, AUTHORITY_HEADERS_ROLE, AUTHORITY_HEADERS_DISPLAY_NAME, AUTHORITY_HEADERS_RELATION, AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME } from "./const/authorityheaders";
import { RedisHelper } from "./utils/redishelper";
import routers from "./routers";
import { LANDHOST, LANDPORT, MAPHOST, MAPPORT, TRACKHOST, TRACKPORT, FARMRECORDHOST, FARMRECORDPORT, AUTHHOST, AUTHPORT } from "./const/microServiceHost";

// setup app
const app: express.Application = express();

app.options("*", cors());
app.use(cors());
app.use(haltOnTimedout);

declare global {
  interface AuthData {
    [x: string]: any;
  }
}

// 不需要token的接口
const userAuthRouters: any[] = [
  // docs
  { method: "POST", url: "/api/track/reference" },
  { method: "GET", url: "/api/track/reference" },
  { method: "PUT", url: "/api/track/reference" },

  { method: "POST", url: /login/ },
];
app.use(tokenParser(userAuthRouters));
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err instanceof HttpResponse) {
    res.status(err.code).json(err);
  } else {
    next();
  }
});

app.use("/api/join", routers);

const onAuthProxyReq = (proxyReq: any, req: any, res: any) => {
  for (const header of AUTHORITY_HEADERS) {
    if (req[header]) {
      if (typeof req[header] === "object") {
        proxyReq.setHeader(header, JSON.stringify(req[header]));
      } else {
        proxyReq.setHeader(header, req[header]);
      }
    } else {
      proxyReq.removeHeader(header);
    }
  }
};

const logTimeProxyRes = (proxyRes: any, req: any, res: any) => {
  // proxyRes.setHeader("x-response-time", (Number(Date.now() - req.startTime)));
  // console.log(proxyRes);
};

const routingProxies: any[] = [
  { host: LANDHOST, port: LANDPORT, routingRules: "farmwork", additionalOptions: { onProxyReq: onAuthProxyReq, onProxyRes: logTimeProxyRes } },
  { host: LANDHOST, port: LANDPORT, routingRules: "lands", additionalOptions: { onProxyReq: onAuthProxyReq, onProxyRes: logTimeProxyRes } },
  { host: LANDHOST, port: LANDPORT, routingRules: "landsplus", additionalOptions: { onProxyReq: onAuthProxyReq, onProxyRes: logTimeProxyRes } },
  { host: MAPHOST, port: MAPPORT, routingRules: "maps", additionalOptions: { onProxyReq: onAuthProxyReq, onProxyRes: logTimeProxyRes } },
  { host: TRACKHOST, port: TRACKPORT, routingRules: "track", additionalOptions: { onProxyReq: onAuthProxyReq, onProxyRes: logTimeProxyRes } },
  { host: FARMRECORDHOST, port: FARMRECORDPORT, routingRules: "farmrecord", additionalOptions: { onProxyReq: onAuthProxyReq, onProxyRes: logTimeProxyRes } },
  { host: FARMRECORDHOST, port: FARMRECORDPORT, routingRules: "farmrecords", additionalOptions: { onProxyReq: onAuthProxyReq, onProxyRes: logTimeProxyRes } },
  {
    host: AUTHHOST, port: AUTHPORT, routingRules: "author/login", additionalOptions: {
      onProxyRes: (proxyRes: any, req: any, res: any) => {
        for (const header of AUTHORITY_HEADERS) {
          if (typeof proxyRes.headers[header] === "undefined") {
            return;
          }
        }

        for (let key in proxyRes.headers) {
          try {
            proxyRes.headers[key] = JSON.parse(proxyRes.headers[key]);
          } catch (error) {
          }
        }

        const authData: AuthData = {
          userID: proxyRes.headers[AUTHORITY_HEADERS_USER_ID],
          userName: proxyRes.headers[AUTHORITY_HEADERS_USER_NAME],
          displayName: proxyRes.headers[AUTHORITY_HEADERS_DISPLAY_NAME],
          enterpriseID: proxyRes.headers[AUTHORITY_HEADERS_ENTERPRISE_ID],
          departmentIDs: proxyRes.headers[AUTHORITY_HEADERS_DEPARTMENT_ID],
          hasUserDepartmentIDs: proxyRes.headers[AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID],
          token: proxyRes.headers[AUTHORITY_HEADERS_TOKEN],
          type: proxyRes.headers[AUTHORITY_HEADERS_TYPE],
          currentDepartment: proxyRes.headers[AUTHORITY_HEADERS_CURRENT_DEPARTMENT],
          role: proxyRes.headers[AUTHORITY_HEADERS_ROLE],
          relation: proxyRes.headers[AUTHORITY_HEADERS_RELATION],
          departmentName: proxyRes.headers[AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME],
        };
        RedisHelper.savePrivilegeWithToken(authData.token, authData);
        for (const header of AUTHORITY_HEADERS) {
          delete proxyRes.headers[header];
        }
      }
    }
  },
  { host: AUTHHOST, port: AUTHPORT, routingRules: "author", additionalOptions: { onProxyReq: onAuthProxyReq } },
  { host: AUTHHOST, port: AUTHPORT, routingRules: "auth", additionalOptions: { onProxyReq: onAuthProxyReq } },
  { host: AUTHHOST, port: AUTHPORT, routingRules: "weather", additionalOptions: { onProxyReq: onAuthProxyReq } },
];

for (const item of routingProxies) {
  const options = Object.assign({}, { logLevel: "debug", target: `http://${item.host}:${item.port}` }, item.additionalOptions);
  app.use(`/api/${item.routingRules}`, proxy(options));
}

const server = app.listen(3001);
console.log(`Server start and listen on port 3001`);
// Logger.debugLog(`Server start and listen on port 3000`);
