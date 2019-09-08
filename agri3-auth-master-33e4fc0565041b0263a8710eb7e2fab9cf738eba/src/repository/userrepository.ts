/**
 * Created by jiangwei on 2018/07/19.
 * Copyright (c) 2018 (jw872505975@gmail.com). All rights reserved.
 */
import { BaseRepository } from "../base/baserepository";
import { DBClient, Model, QueryResult, SelectQuery, InsertQuery, UpdateQuery } from "sakura-node-3";
import { User } from "../model/user";
import { Department } from "../model/department";
// import { DepartmentRepository } from "./departmentrepository";
import { PaginationService } from "../service/paginationservice";

/* tslint:disable:ter-max-len max-params */
export class UserRepository extends BaseRepository {
  static async isUserExisted(telephone: string): Promise<boolean> {
    const query: SelectQuery = new SelectQuery()
      .select(["1"])
      .fromClass(User)
      .where(`(username='${telephone}' OR telephone='${telephone}') AND is_deleted=false`);
    const results: QueryResult = await DBClient.getClient().query(query);
    return results.rowCount > 0;
  }

  static async findUserByUsername(username: string): Promise<User & Department> {
    const sql: SelectQuery = new SelectQuery()
      .select(["user_id", "username", "password", "salt", "display_name", "role", "users.department_id", "users.enterprise_id", "data_authority_id", "children_departments_have_users", "children_departments", "department_name"])
      .fromClass(User)
      .innerJoin("departments")
      .on("departments.department_id=users.department_id")
      .where(`username='${username}' AND users.is_deleted=false`);
    const result: QueryResult = await DBClient.getClient().query(sql);
    if (result.rows[0]) {
      return Model.compositeModelFromRow(result.rows[0], User, Department);
    }
    return undefined;
  }

  static async findUsersUnderDepartment(parentId: number, displayName: string, orderField: string, orderType: string, hasPage: boolean, hasSize: boolean, page: number, size: number): Promise<QueryResult> {

    const userWhereSqls: string[] = [
      "is_deleted=false",
      "role='user'"
    ];
    const departmentWhereSqls: string[] = [
      "is_deleted=false"
    ];

    if (parentId > 0) {
      departmentWhereSqls.push(`department_id=${parentId}`);
    }

    if (displayName !== "" && displayName !== undefined && displayName !== null) {
      userWhereSqls.push(`display_name like '%${displayName}%'`);
    }

    const departmentQuery: SelectQuery = new SelectQuery().fromClass(Department)
      .select(["children_departments"])
      .where(departmentWhereSqls.join(" AND "));

    const departmentResults: QueryResult = await DBClient.getClient().query(departmentQuery);
    if (departmentResults.rowCount === 0) {
      return undefined;
    }

    const childrenDepartments: number[] = departmentResults.rows[0]["children_departments"];
    if (parentId > 0) {
      childrenDepartments.push(parentId);
      const chidrenDepartmentsSql = childrenDepartments.map((ele: number) => `(${ele})`).join(",");
      userWhereSqls.push(`department_id=ANY(VALUES ${chidrenDepartmentsSql})`);
    }

    const userQuery: SelectQuery = new SelectQuery().fromClass(User)
      .select(["user_id", "username", "display_name", "role", "telephone", "data_authority_id", "department_id", "enterprise_id", "created_at"])
      .where(userWhereSqls.join(" AND "))
      .orderBy("user_id", "ASC");

    const querySql: string = DBClient.getClient().queryToString(userQuery);
    const userResults: QueryResult = await PaginationService.generateQueryWithWebPagination(querySql, orderField, orderType, hasPage, hasSize, page, size);

    return userResults;
  }

  static async findUsersByDepartment(departmentId: number): Promise<User[]> {
    const whereSqls: string[] = [
      "is_deleted=false"
    ];

    if (departmentId > 0) {
      whereSqls.push(`department_id=${departmentId}`);
    }

    const query: SelectQuery = new SelectQuery().fromClass(User)
      .select(["user_id", "username", "display_name", "role", "telephone", "data_authority_id"])
      .where(whereSqls.join(" AND "));

    const results: QueryResult = await DBClient.getClient().query(query);
    return Model.modelsFromRows(results.rows, User);
  }

  static async findUsersByEnterpriseId(enterpriseId: number): Promise<User[]> {
    const sql: SelectQuery = new SelectQuery()
      .select()
      .fromClass(User)
      .where(`enterprise_id=${enterpriseId}`);
    const result: QueryResult = await DBClient.getClient().query(sql);
    return Model.modelsFromRows(result.rows, User);
  }

  static getAddingUserSql(user: User): string[] {
    const insertQuery: InsertQuery = new InsertQuery().fromModel(user);

    return [DBClient.getClient().queryToString(insertQuery)];
  }

  static async addUser(user: User): Promise<number> {
    const results: QueryResult = await DBClient.getClient().queryRawInTransaction(UserRepository.getAddingUserSql(user));
    return Number(results.rows[0]["user_id"]);
  }

  static async removeUserById(userId: number): Promise<void> {
    const user = new User();
    user.isDeleted = true;
    const query = new UpdateQuery().fromModel(user).where(`is_deleted=false AND user_id=${userId}`);
    await DBClient.getClient().query(query);
  }

  static async getDepartmentUserCount(departmentId: number): Promise<number> {
    const query: SelectQuery = new SelectQuery().fromClass(User)
      .select(["count(1) AS user_counter"])
      .where(`department_id=${departmentId} AND is_deleted=false AND role='users'`);

    const results: QueryResult = await DBClient.getClient().query(query);
    return Number(results.rows[0]["user_counter"]);
  }

  static async getPasswordAndSalt(id: number): Promise<User> {
    const query: SelectQuery = new SelectQuery().fromClass(User).where(`user_id=${id} AND is_deleted=false`);
    const results = await DBClient.getClient().query(query);
    if (results.rowCount === 0) {
      return undefined;
    }
    return Model.modelFromRow(results.rows[0], User);
  }


  static async updateUserById(id: number, user: User): Promise<void> {
    const query: UpdateQuery = new UpdateQuery().fromModel(user).where(`user_id=${id} AND is_deleted=false`);
    await DBClient.getClient().query(query);
  }

  static async getUsersByDepartmentId(departmentId: number): Promise<User[]> {
    const userQuery: SelectQuery = new SelectQuery().fromClass(User)
      .select(["user_id", "username", "display_name", "role", "telephone", "data_authority_id", "department_id", "enterprise_id", "created_at"])
      .where(`is_deleted=false AND department_id=${departmentId}`)
      .orderBy("user_id", "ASC");
    const results: QueryResult = await DBClient.getClient().query(userQuery);
    return Model.modelsFromRows<User>(results.rows, User);
  }

}
