import { BaseRepository } from "../base/baserepository";
import { DBClient, Model, QueryResult, SelectQuery, UpdateQuery } from "sakura-node-3";
import { Department } from "../model/department";
import { User } from "../model/user";

/* tslint:disable:ter-max-len */
export class DepartmentRepository extends BaseRepository {
  static async canDepartmentDelete(departmentId: number, enterpriseId: number): Promise<boolean> {
    const query = new SelectQuery().select(["1"])
      .fromClass(Department)
      .where(`department_id=${departmentId} AND enterprise_id=${enterpriseId} AND has_users=false AND is_deleted=false AND children_departments='[]'`);
    const results = await DBClient.getClient().query(query);
    return results.rowCount > 0;
  }

  static getAddingDepartmentUser(departmentId: number): string[] {
    const updateSelfQuery: string = `UPDATE departments SET  updated_at=NOW(), has_users=true WHERE department_id=${departmentId};`;

    const updateParentQuery: string = `UPDATE departments SET updated_at=NOW(),  has_users=true, children_departments_have_users = children_departments_have_users || '["${departmentId}"]'::jsonb WHERE children_departments @> '["${departmentId}"]';`;

    return [updateSelfQuery, updateParentQuery];
  }

  static async addDepartmentUser(departmentId: number): Promise<void> {
    await DBClient.getClient().queryRawInTransaction(DepartmentRepository.getAddingDepartmentUser(departmentId));
  }

  static async getDepartmentByIds(ids: number[]): Promise<Department[]> {
    const idQuery = ids.map((id: number) => `(${id})`).join(",");
    const query: SelectQuery = new SelectQuery().fromClass(Department)
      .select(["department_id", "department_name", "parent_department_id", "children_departments"])
      .where(`department_id=ANY(VALUES ${idQuery}) AND is_deleted=false`)
      .orderBy("department_id", "ASC");
    const results: QueryResult = await DBClient.getClient().query(query);
    return Model.modelsFromRows<Department>(results.rows, Department);
  }

  static async getSubDepartmentsByUserId(userId: number): Promise<Department & User> {
    const query: SelectQuery = new SelectQuery().fromClass(Department)
      .select(["users.display_name", "users.role", "users.enterprise_id", "departments.department_id", "children_departments", "children_departments_have_users"])
      .innerJoin("users")
      .on("users.department_id=departments.department_id")
      .where(`user_id=${userId} AND users.is_deleted=false AND departments.is_deleted=false`)
      .orderBy("departments.department_id", "ASC");
    const results: QueryResult = await DBClient.getClient().query(query);
    return Model.compositeModelFromRow<Department, User>(results.rows[0], Department, User);
  }

  static async removeEmptyDepartment(departmentId: number): Promise<void> {
    const updateParentQuery: string = `UPDATE departments SET updated_at=NOW(), has_users=false, children_departments_have_users='[]'
    FROM departments tmp
    WHERE tmp.children_departments_have_users='["${departmentId}"]' AND tmp.is_deleted=false;`;
    const updateSelfQuery: string = `UPDATE departments SET updated_at=NOW(), has_users=false WHERE department_id=${departmentId};`;
    await DBClient.getClient().queryRawInTransaction([updateParentQuery, updateSelfQuery]);
  }

  static async addDepartment(department: Department, parentId: number): Promise<number> {
    const parentSql: string = parentId ? `parent_departments || '["${parentId}"]'::jsonb` : "'[]'";// tslint:disable-line
    const queryParentIdSql: string = parentId ? ` FROM departments WHERE department_id=${parentId}` : "";// tslint:disable-line
    const parentVal = parentId ? parentId : "NULL";
    const insertQuery: string = `
      INSERT INTO departments (department_name, enterprise_id, parent_departments, children_departments,  children_departments_have_users, has_users, parent_department_id, is_deleted, created_at, updated_at)
      SELECT '${department.departmentName}', ${department.enterpriseId}, ${parentSql}, '[]', '[]', ${department.hasUsers}, ${parentVal}, false, NOW(), NOW()  ${queryParentIdSql}
      RETURNING department_id;
    `;
    const results: QueryResult = await DBClient.getClient().query(insertQuery);
    const departmentId: number = Number(results.rows[0]["department_id"]);

    if (parentId) {
      const updateQuery: string = `
        UPDATE departments
        SET updated_at=NOW(), children_departments = children_departments || '["${departmentId}"]'::jsonb
        WHERE children_departments @> '["${parentId}"]' OR department_id=${parentId};
      `;
      await DBClient.getClient().query(updateQuery);
    }

    return departmentId;
  }

  static async removeDepartment(departmentId: number, enterpriseId: number): Promise<void> {
    const removeSpecificIdQuery = `UPDATE departments SET updated_at=NOW(), is_deleted=true WHERE department_id=${departmentId}  AND is_deleted=false  AND enterprise_id=${enterpriseId};`;
    const removeChildrenQuery = `UPDATE departments SET updated_at=NOW(), children_departments = children_departments - '${departmentId}', children_departments_have_users = children_departments_have_users - '${departmentId}'  WHERE children_departments @> '["${departmentId}"]'  AND is_deleted=false  AND enterprise_id=${enterpriseId};`;

    await DBClient.getClient().queryRawInTransaction([removeSpecificIdQuery, removeChildrenQuery]);
  }

  static async updateDepartmentById(departmentId: number, department: Department): Promise<void> {
    const query: UpdateQuery = new UpdateQuery().fromModel(department).where(`department_id=${departmentId} AND is_deleted=false`);
    await DBClient.getClient().query(query);
  }

  static async getDepartmentById(departmentId: number, enterpriseId: number): Promise<Department> {
    const query: SelectQuery = new SelectQuery()
      .fromClass(Department)
      .select(["department_name", "children_departments", "parent_departments", "children_departments_have_users", "parent_department_id"])
      .where(`is_deleted=false AND department_id=${departmentId} AND enterprise_id=${enterpriseId}`);

    const results: QueryResult = await DBClient.getClient().query(query);
    if (results.rowCount > 0) {
      return Model.modelFromRow(results.rows[0], Department);
    }
    return undefined;
  }

  static async getDepartmentsIdAndParent(departmentIds: number[], enterpriseId: number): Promise<Department[]> {
    const idQuery = departmentIds.map((id: number) => `(${id})`).join(",");
    const departmentQuery = departmentIds.length === 0 ? "" : `AND department_id=ANY(VALUES ${idQuery})`;

    const query: SelectQuery = new SelectQuery()
      .fromClass(Department)
      .select(["department_id", "parent_department_id"])
      .where(`is_deleted=false ${departmentQuery} AND enterprise_id=${enterpriseId}`);

    const results: QueryResult = await DBClient.getClient().query(query);
    return Model.modelsFromRows(results.rows, Department);
  }

  static async getHasUserDepartments(departmentId: number, enterpriseId: number): Promise<Department[]> {
    const query: string = `
      WITH all_ids AS (
        SELECT CAST(jsonb_array_elements_text(children_departments_have_users) AS int8) AS ids FROM departments
        WHERE department_id=${departmentId} AND enterprise_id=${enterpriseId} AND is_deleted=false
      )
      SELECT department_id, department_name, parent_department_id FROM departments
      INNER JOIN all_ids ON ids=department_id
      WHERE is_deleted=false;
    `;
    const results: QueryResult = await DBClient.getClient().query(query);
    return Model.modelsFromRows(results.rows, Department);
  }

  /**
   * get the sub list
   * @param parentId parent id, if it is undefined, it will get the sub list of the root
   * @param enterpriseId enterprise id
   */
  static async getSubDepartments(parentId: number, enterpriseId: number, needAll: boolean = false): Promise<Department[]> {
    const whereSqls: string[] = [
      "is_deleted=false",
      `enterprise_id=${enterpriseId}`
    ];

    if (parentId > 0) {
      whereSqls.push(`parent_department_id=${parentId}`);
    } else if (!needAll) {
      whereSqls.push(`parent_department_id IS NULL`);
    }

    const query: SelectQuery = new SelectQuery().fromClass(Department)
      .select(["department_id", "department_name", "has_users", "parent_department_id", "children_departments", "children_departments_have_users", "parent_department_id"])
      .orderBy("department_id", "ASC")
      .where(whereSqls.join(" AND "));
    const results: QueryResult = await DBClient.getClient().query(query);
    return Model.modelsFromRows(results.rows, Department);
  }

  static async getDepartmentsByName(name: string, enterpriseId: number): Promise<Department[]> {
    const whereSqls: string[] = [
      "is_deleted=false",
      `enterprise_id=${enterpriseId}`,
      `department_name='${name}'`
    ];

    const query: SelectQuery = new SelectQuery().fromClass(Department)
      .select(["department_id", "department_name", "has_users", "parent_department_id", "children_departments", "children_departments_have_users"])
      .orderBy("department_id", "ASC")
      .where(whereSqls.join(" AND "));
    const results: QueryResult = await DBClient.getClient().query(query);
    return Model.modelsFromRows(results.rows, Department);
  }

  static async getAllDepartmentIds(): Promise<number[]> {
    const query: SelectQuery = new SelectQuery().fromClass(Department)
      .select(["department_id"])
      .where("is_deleted=false");
    const results: QueryResult = await DBClient.getClient().query(query);
    const ids: number[] = results.rows.map((ele) => Number(ele["department_id"]));
    return ids;
  }

}
