/**
 * Created by jiangwei on 2018/07/19.
 * Copyright (c) 2018 (jw872505975@gmail.com). All rights reserved.
 */
import * as crypto from "crypto";
import { User } from "../model/user";
import { UserRepository } from "../repository/userrepository";
import { DataAuthority, LoginResult } from "../controller/usercontroller";
import { Department } from "../model/department";
import { DepartmentRepository } from "../repository/departmentrepository";
import { DBClient, QueryResult, Model } from "sakura-node-3";
import { ROLE_ADMIN } from "../const/role";
import { RequestUtils } from "../utils/requestutils";
import { REQUEST_TYPE } from "../const/requesttype";
import { DEMO_SERVER } from "../const/extenalapi";
import { DepartmentService } from "./departmentservice";
import { EXTERNAL_INFO } from "../const/extenalinfo";

export class UserService {
  static async addUser(user: User): Promise<number> {
    const isExisted: boolean = await UserRepository.isUserExisted(user.telephone);
    if (!isExisted) {
      const queries: string[] = [...UserRepository.getAddingUserSql(user), ...DepartmentRepository.getAddingDepartmentUser(user.departmentId)];
      const results: QueryResult = await DBClient.getClient().queryRawInTransaction(queries);
      return Number(results.rows[0]["user_id"]);
    } else {
      throw new Error(`user already existed`);
    }
  }

  static async findUsersUnderDepartment(parentId: number, displayName: string, orderField: string, orderType: string, hasPage: boolean, hasSize: boolean, page: number, size: number): Promise<any> {
    const results: QueryResult = await UserRepository.findUsersUnderDepartment(parentId, displayName, orderField, orderType, hasPage, hasSize, page, size);
    let totalSize = 0;
    if (!results) {
      return {
        totalSize,
        users: []
      };
    }

    const users = results.rows.map((result: any) => {
      totalSize = Number(result["total_size"]);
      return Model.modelFromRow<User>(result, User);
    });
    return { users, totalSize };
  }

  /**
   * remove user by id and return the count of the specific department
   * @param userId
   */
  static async removeUser(userId: number): Promise<void> {
    const user: User = await UserRepository.findByPrimaryKey<User>(User, userId);
    if (!user) {
      throw new Error(`user is not existed`);
    }

    await UserRepository.removeUserById(userId);
    const count: number = await UserRepository.getDepartmentUserCount(user.departmentId);
    if (count === 0) {
      await DepartmentRepository.removeEmptyDepartment(user.departmentId);
    }
  }

  static async getAdminDepartments(user: User & Department): Promise<User & Department> {
    if (user.role === ROLE_ADMIN) {
      const departments: Department[] = await DepartmentRepository.getSubDepartments(undefined, user.enterpriseId, true);
      user.childDepartments = departments.map(ele => Number(ele.departmentId));
      user.childDepartmentsHaveUser = departments.filter(ele => ele.hasUsers).map(ele => Number(ele.departmentId));
    }
    return user;
  }

  static async loginFromGago(eId: string, eToken: string): Promise<LoginResult> {
    // if the request throws some errors, it means that it is a wrong token

    try {
      await RequestUtils.request(REQUEST_TYPE.POST, DEMO_SERVER.API_CHECK_GAGO_USERS, {eId, eToken});
    } catch (error) {
      throw new Error("NOT_MATCH");
    }

    const departments: Department[] = await DepartmentService.getDepartmentsByName(EXTERNAL_INFO.DEPARTMENT_NAME, EXTERNAL_INFO.ENTERPRISE_ID);

    const user = new User();
    user.dataAuthorityId = 2;
    user.displayName = EXTERNAL_INFO.USERNAME;
    user.enterpriseId = EXTERNAL_INFO.ENTERPRISE_ID;
    user.password = EXTERNAL_INFO.PASSWORD;
    user.role = ROLE_ADMIN;
    user.salt = EXTERNAL_INFO.PASSWORD;
    user.telephone = EXTERNAL_INFO.USERNAME;
    user.username = EXTERNAL_INFO.USERNAME;

    let userId = -1;
    let departmentId = -1;
    if (departments.length === 0) {
      const department = new Department();
      department.childDepartments = [];
      department.childDepartmentsHaveUser = [];
      department.departmentName = EXTERNAL_INFO.DEPARTMENT_NAME;
      department.enterpriseId = EXTERNAL_INFO.ENTERPRISE_ID;
      department.hasUsers = true;
      department.parentDepartments = [];

      departmentId = await DepartmentService.addDepartment(department, null);
      user.departmentId = departmentId;
      userId = await UserService.addUser(user);
    } else {
      let users: User[] = await UserRepository.getUsersByDepartmentId(departments[0].departmentId);
      users = users.filter((item: User) => item.username === EXTERNAL_INFO.USERNAME);
      if (users.length === 0) {
        user.departmentId = departments[0].departmentId;
        userId = await UserService.addUser(user);
      }
    }

    const gagoUser: User & Department = await UserRepository.findUserByUsername(EXTERNAL_INFO.USERNAME);

    if (gagoUser) {
      return {
        token: crypto.randomBytes(48).toString("hex"),
        userId: gagoUser.userId,
        username: EXTERNAL_INFO.USERNAME,
        displayName: EXTERNAL_INFO.USERNAME,
        role: ROLE_ADMIN,
        enterpriseId: EXTERNAL_INFO.ENTERPRISE_ID,
        dataAuthorityId: gagoUser.dataAuthorityId,
        departments: gagoUser.childDepartments.map(Number),
        departmentsHaveUsers: gagoUser.childDepartmentsHaveUser.map(Number),
        departmentId: gagoUser.departmentId,
        departmentName: EXTERNAL_INFO.DEPARTMENT_NAME
      };
    } else {
      throw new Error("NOT_MATCH");
    }
  }

  static async login(username: string, rawPassword: string): Promise<LoginResult> {
    let user: User & Department = await UserRepository.findUserByUsername(username);
    if (user && user.password === User.encryptPassword(user.salt, rawPassword)) {
      user = await UserService.getAdminDepartments(user);
      const token: string = crypto.randomBytes(48).toString("hex");
      return {
        token,
        userId: user.userId,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        enterpriseId: user.enterpriseId,
        dataAuthorityId: user.dataAuthorityId,
        departments: user.childDepartments.map(Number),
        departmentsHaveUsers: user.childDepartmentsHaveUser.map(Number),
        departmentId: user.departmentId,
        departmentName: user.departmentName
      };
    } else {
      throw new Error("NOT_MATCH");
    }
  }

  static async updateUserById(userId: number, user: User): Promise<void> {
    await UserRepository.updateUserById(userId, user);
  }


  static async getPasswordAndSalt(userId: number): Promise<User> {
    const user: User = await UserRepository.getPasswordAndSalt(userId);
    return user;
  }

  static async dataAuthority(userId: number): Promise<DataAuthority> {
    const user: User = await UserRepository.findByPrimaryKey(User, userId);
    if (user) {
      // 1=全部部门数据 2=所在部门及子部门数据 3=所在部门数据 4=仅自己数据
      if (user.dataAuthorityId === 1) {
        return {
          dataAuthorityId: 1,
          departmentIds: [],
          userId: user.userId,
          enterpriseId: user.enterpriseId
        };
      } else if (user.dataAuthorityId === 2) {
        // const departmentRoot: Department = await DepartmentService.findDepartementById(user.departmentId);
        // await DepartmentService.findEnterpriseDepartmentTree(departmentRoot);
        // const departmentIds: number[] = [];
        // DepartmentService.findDepartmentTreeIds(departmentRoot, departmentIds);
        // return {
        //   dataAuthorityId: 2,
        //   departmentIds: departmentIds,
        //   userId: user.userId,
        //   enterpriseId: user.enterpriseId
        // }
      } else if (user.dataAuthorityId === 3) {
        return {
          dataAuthorityId: 3,
          departmentIds: [user.departmentId],
          userId: user.userId,
          enterpriseId: user.enterpriseId
        };
      } else {
        // 默认是4
        return {
          dataAuthorityId: 4,
          departmentIds: [],
          userId: user.userId,
          enterpriseId: user.enterpriseId
        };
      }
    } else {
      throw new Error(`not match user, user_id: ${userId}`);
    }

  }
}
