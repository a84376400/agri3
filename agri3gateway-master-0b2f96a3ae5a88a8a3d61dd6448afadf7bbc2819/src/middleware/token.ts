import { AuthErrorResponse } from "sakura-node-3";
import { Request } from "../base/basecontroller";
import * as express from "express";
import * as url from "url";
import { RedisHelper } from "../utils/redishelper";
import { AUTHORITY_HEADERS_DEPARTMENT_ID, AUTHORITY_HEADERS_ENTERPRISE_ID, AUTHORITY_HEADERS_TYPE, AUTHORITY_HEADERS_USER_ID, AUTHORITY_HEADERS_TOKEN, AUTHORITY_HEADERS_USER_NAME, AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID, AUTHORITY_HEADERS, AUTHORITY_HEADERS_CURRENT_DEPARTMENT, AUTHORITY_HEADERS_ROLE, AUTHORITY_HEADERS_DISPLAY_NAME, AUTHORITY_HEADERS_RELATION, AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME } from "../const/authorityheaders";
import { AUTH_FAILED_UNKNOWN_ISSUE } from "../const/authorityerror";
import { RequestUtils } from "../utils/requestutils";
import { REQUEST_TYPE } from "../const/requesttype";
import { AUTHHOST } from "../const/microServiceHost";
import { AUTHPORT } from "../const/microServiceHost";

interface TokenFilterOption {
  method: string;
  url: string;
}

/**
 * Token middleware for parsing token and add "userId" to express.Request.
 */
export function tokenParser(exceptions: TokenFilterOption[]): (req: Request, res: express.Response, next: express.NextFunction) => Promise<void> {

  return async (req: Request, res: express.Response, next: express.NextFunction): Promise<void> => {

    // 处理 不需要验证的接口 例如 登陆 直接转发到后台服务
    for (const exception of exceptions) {
      if (url.parse(req.url).pathname.match(exception.url) && exception.method.toLowerCase() === req.method.toLowerCase()) {
        console.log(" not need  ");
        next();
        return;
      }
    }

    let token: string = req.header("Token") || req.header("token") || req.query["Token"] || req.query["token"] || req.params["Token"] || req.params["token"];

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const INTERNAL_MONITOR_TOKEN = process.env["INTERNAL_MONITOR_TOKEN"];
    console.log("remote ip", ip);
    if (ip === process.env["INTERNAL_MONITOR_IP"]) {
      token = INTERNAL_MONITOR_TOKEN;
    } else {
      if (!token || token.trim() === INTERNAL_MONITOR_TOKEN) {
        // 没有token 返回
        next(AuthErrorResponse.missingAuthToken());
        return;
      }
    }

    try {
      const privilege: AuthData = await RedisHelper.findPrivilegeInToken(token);
      if (!privilege) {
        return next(new AuthErrorResponse(AUTH_FAILED_UNKNOWN_ISSUE, 401));
      }

      for (let key in privilege) {
        try {
          privilege[key] = JSON.parse(privilege[key]);
        } catch (error) {
        }
      }

      req[AUTHORITY_HEADERS_DEPARTMENT_ID] = privilege.departmentIDs;
      req[AUTHORITY_HEADERS_ENTERPRISE_ID] = privilege.enterpriseID;
      req[AUTHORITY_HEADERS_USER_ID] = privilege.userID;
      req[AUTHORITY_HEADERS_USER_NAME] = privilege.userName;
      req[AUTHORITY_HEADERS_DISPLAY_NAME] = privilege.displayName;
      req[AUTHORITY_HEADERS_TYPE] = privilege.type;
      req[AUTHORITY_HEADERS_TOKEN] = token;
      req[AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID] = privilege.hasUserDepartmentIDs;
      req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT] = privilege.currentDepartment;
      req[AUTHORITY_HEADERS_ROLE] = privilege.role;
      req[AUTHORITY_HEADERS_RELATION] = privilege.relation;
      req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME] = privilege.departmentName;

     
      // 为了及时更新所有部门数据，先 work around 的在这里去调用 api 来更新数据
      const headers: any = {};
      for (const key of AUTHORITY_HEADERS) {
        if (typeof req[key] === "object") {
          headers[key] = JSON.stringify(req[key]);
        } else {
          headers[key] = req[key];
        }
      }

      const data = await RequestUtils.request(REQUEST_TYPE.GET, `http://${AUTHHOST}:${AUTHPORT}/api/auth/users/departments`, {}, headers);

      privilege.hasUserDepartmentIds = data.data.childDepartmentsHaveUser;
      privilege.departmentIds = data.data.childDepartments;
      privilege.relation = data.data.relation;
      privilege.displayName = Buffer.from(data.data.displayName).toString("hex");

      req[AUTHORITY_HEADERS_DEPARTMENT_ID] = privilege.departmentIds;
      req[AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID] = privilege.hasUserDepartmentIds;
      req[AUTHORITY_HEADERS_RELATION] = privilege.relation;
      req[AUTHORITY_HEADERS_DISPLAY_NAME] = privilege.displayName;

      // 更新一下过期时间
      RedisHelper.savePrivilegeWithToken(token, privilege);
      return next();
    } catch (err) {
      console.log(err);
      next(new AuthErrorResponse(AUTH_FAILED_UNKNOWN_ISSUE, 401));
    }
  };
}
