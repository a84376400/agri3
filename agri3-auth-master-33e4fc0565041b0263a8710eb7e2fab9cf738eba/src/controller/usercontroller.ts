import { NextFunction, Request, Response } from "../base/basecontroller";
import { AuthErrorResponse, BadRequestResponse, ErrorResponse, SuccessResponse, Validator } from "sakura-node-3";
import { UserService } from "../service/userservice";
import { Department } from "../model/department";
import { User } from "../model/user";
import { SystemErrorResponse } from "../base/systemerrorresponse";
import { AUTHORITY_HEADERS_USER_ID, AUTHORITY_HEADERS_ENTERPRISE_ID, AUTHORITY_HEADERS_TOKEN, AUTHORITY_HEADERS_USER_NAME, AUTHORITY_HEADERS_TYPE, AUTHORITY_HEADERS_DEPARTMENT_ID, AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID, AUTHORITY_HEADERS_CURRENT_DEPARTMENT, AUTHORITY_HEADERS_ROLE, AUTHORITY_HEADERS_DISPLAY_NAME, AUTHORITY_HEADERS_RELATION, AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME } from "../const/authorityheaders";
import { ROLE_USER, ROLE_ADMIN } from "../const/role";
import { DepartmentService, DepartmentInfo } from "../service/departmentservice";
import { HAS_PAGINATION_PAGE, HAS_PAGINATION_SIZE, PAGINATION_PAGE, PAGINATION_SIZE } from "../middleware/pagination";

/**
 * Created by jiangwei on 2018/07/19.
 * Copyright (c) 2018 (jw872505975@gmail.com). All rights reserved.
 */
export class UserController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    // validation
    const validator: Validator = new Validator();
    const token = req.body["eToken"] !== undefined ? validator.toStr(req.body["eToken"]) : "";
    const eid = req.body["eId"] !== undefined ? validator.toStr(req.body["eId"]) : "";
    const hasToken = token.length > 0;
    const username: string = hasToken ? "" : validator.toStr(req.body["username"]);
    const password: string = hasToken ? "" : validator.toStr(req.body["password"]);

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const loginResult: LoginResult = hasToken ? await UserService.loginFromGago(eid, token) : await UserService.login(username, password);
      if (loginResult.departments.indexOf(loginResult.departmentId) === -1) {
        loginResult.departments.push(loginResult.departmentId);
      }
      const departmentResults: DepartmentInfo[] = await DepartmentService.getDepartmentsByIds(loginResult.departments);
      const departments = departmentResults.map((ele: Department) => {
        return {
          departmentId: ele.departmentId,
          departmentName: ele.departmentName,
          haveUsers: loginResult.departmentsHaveUsers.indexOf(ele.departmentId) > -1,
          parentDepartmentId: ele.parentDepartmentId
        };
      });

      const relationships = departments.map((ele: any) => `${ele.parentDepartmentId}:${ele.departmentId}`).join(",");
      // console.log(relationships);
      // add the authority data into header, in order to have the minimize effects in the proxy
      res.setHeader(AUTHORITY_HEADERS_USER_ID, loginResult.userId);
      res.setHeader(AUTHORITY_HEADERS_TOKEN, loginResult.token);
      res.setHeader(AUTHORITY_HEADERS_ENTERPRISE_ID, loginResult.enterpriseId);
      res.setHeader(AUTHORITY_HEADERS_DEPARTMENT_ID, JSON.stringify(loginResult.departments));
      res.setHeader(AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID, JSON.stringify(loginResult.departmentsHaveUsers));
      res.setHeader(AUTHORITY_HEADERS_TYPE, loginResult.dataAuthorityId);
      res.setHeader(AUTHORITY_HEADERS_USER_NAME, loginResult.username);
      res.setHeader(AUTHORITY_HEADERS_DISPLAY_NAME, Buffer.from(loginResult.displayName).toString("hex"));
      res.setHeader(AUTHORITY_HEADERS_CURRENT_DEPARTMENT, loginResult.departmentId);
      res.setHeader(AUTHORITY_HEADERS_ROLE, loginResult.role);
      res.setHeader(AUTHORITY_HEADERS_RELATION, relationships);
      res.setHeader(AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME, Buffer.from(loginResult.departmentName).toString("hex"));

      // remove the useless fields
      delete loginResult.departmentsHaveUsers;

      next(new SuccessResponse(Object.assign({}, loginResult, { departments })));
    } catch (e) {
      console.log(e);
      if (e.message === "NOT_MATCH") {
        next(new AuthErrorResponse("USERNAME_OR_PASSWORD_ERROR"));
      } else {
        next(new SystemErrorResponse());
      }
    }
  }

  static async getUsers(req: any, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const parentId: number = req.query["parent_id"] ? validator.toNumber(req.query["parent_id"], "invalid parent") : undefined;
    const displayName: string = req.query["display_name"] ? validator.toStr(req.query["display_name"], "invalid displayName") : undefined;
    const orderField: string = "user_id";
    const orderType: string = "ASC";

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const users = await UserService.findUsersUnderDepartment(parentId, displayName, orderField, orderType, req[HAS_PAGINATION_PAGE], req[HAS_PAGINATION_SIZE], req[PAGINATION_PAGE], req[PAGINATION_SIZE]);
      next(new SuccessResponse(users));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async addUser(req: any, res: Response, next: NextFunction): Promise<void> {
    // validation
    const validator: Validator = new Validator();
    const displayName: string = validator.toStr(req.body["displayName"]);
    const telephone: string = validator.toStr(req.body["telephone"]);
    // const username: string = validator.toStr(req.body["username"]);
    const password: string = req.body["password"] ? validator.toStr(req.body["password"]) : "123456";
    const departmentId: number = validator.toNumber(req.body["departmentId"]);
    const dataAuthorityId: number = validator.toNumber(req.body["dataAuthorityId"]);

    // TODO: 通过网关获取企业ID
    const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];
    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const user: User = new User();
      user.initNewUser(enterpriseId,
        displayName,
        password,
        telephone,
        departmentId,
        dataAuthorityId,
        ROLE_USER);
      const id: number = await UserService.addUser(user);
      next(new SuccessResponse({ id }));
    } catch (e) {
      console.log(e);
      if (e && e.message && e.message.match("user already existed")) {
        next(new ErrorResponse(e.message));
      } else {
        next(new SystemErrorResponse());
      }
    }
  }

  static async updateUser(req: any, res: Response, next: NextFunction): Promise<void> {
    // validation
    const validator: Validator = new Validator();
    const displayName: string = validator.toStr(req.body["displayName"]);
    const id: number = validator.toNumber(req.params["id"]);

    // const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];
    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const user: User = new User();
      user.displayName = displayName;
      await UserService.updateUserById(id, user);
      next(new SuccessResponse({ id }));
    } catch (e) {
      console.log(e);
      next(new SystemErrorResponse());
    }
  }


  static async modifyPassword(req: any, res: Response, next: NextFunction): Promise<void> {
    // validation
    const validator: Validator = new Validator();
    const isModifyingOtherPassword: boolean = req[AUTHORITY_HEADERS_ROLE] === ROLE_ADMIN && req.params["id"];
    const oldPassword: string = isModifyingOtherPassword ? undefined : validator.toStr(req.body["oldPassword"]);
    const newPassword: string = validator.toStr(req.body["newPassword"]);
    const id: number = isModifyingOtherPassword ? validator.toNumber(req.params["id"]) : req[AUTHORITY_HEADERS_USER_ID];

    validator.assert(/^[a-zA-Z0-9]{6,12}$/gm.test(newPassword), "invalid newPassword");
    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      if (!isModifyingOtherPassword) {
        const user: User = await UserService.getPasswordAndSalt(id);
        const passwordInput: string = User.encryptPassword(user.salt, oldPassword);
        if (user.password !== passwordInput) {
          next(new AuthErrorResponse("OLD_PASSWORD_ERROR"));
          return;
        }
      }

      let newUser: User = new User();
      newUser.initPassword(newPassword);
      await UserService.updateUserById(id, newUser);
      next(new SuccessResponse({ id }));
    } catch (e) {
      console.log(e);
      next(new SystemErrorResponse());
    }
  }

  static async removeUser(req: any, res: Response, next: NextFunction): Promise<void> {
    // validation
    const validator: Validator = new Validator();
    const id: number = validator.toNumber(req.params["id"]);

    const userId: number = req[AUTHORITY_HEADERS_USER_ID];
    validator.assert(id !== userId, "invalid id");

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      await UserService.removeUser(id);
      next(new SuccessResponse({ id }));
    } catch (e) {
      if (e && e.message && e.message.match("user already existed")) {
        next(new ErrorResponse(e.message));
      } else {
        next(new SystemErrorResponse());
      }
    }
  }

}

export interface LoginResult {
  token: string;
  userId: number;
  username: string;
  displayName: string;
  role: string;
  enterpriseId: number;
  dataAuthorityId: number;
  departments: any;
  departmentsHaveUsers: any;
  departmentId: number;
  departmentName: string;
}

export interface DataAuthority {
  dataAuthorityId: number;
  departmentIds: number[];         // 所属于部门及子部门
  userId: number;
  enterpriseId: number;
}

//     数据权限：
// 所有部门权限
//     {
//       dataAuthorityId: 1
//       departmentIds: []
//       userId:     1234
//       enterpriseId:  9001
//     }
//     当前部门及子部门
//     {
//       dataAuthorityId: 2
//       departmentIds: [111,222,3331]
//       userId:     1235
//       enterpriseId:   9001
//     }
//     当前部门
//     {
//       dataAuthorityId: 3
//       departmentIds: [3331]
//       userId:     7777
//       enterpriseId:  9001
//     }
//     自己
//     {
//       dataAuthorityId: 4
//       userId:      8889
//       enterpriseId:   9001
//     }
