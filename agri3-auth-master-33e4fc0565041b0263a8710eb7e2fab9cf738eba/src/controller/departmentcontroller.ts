import { BaseController, NextFunction, Response } from "../base/basecontroller";
import { Department } from "../model/department";
import { DepartmentService } from "../service/departmentservice";
import { SystemErrorResponse } from "../base/systemerrorresponse";
import { Validator, BadRequestResponse, SuccessResponse } from "sakura-node-3";
import { RemoveDepartmentFailResponse } from "../base/removedepartmentfailresponse";
import {
  AUTHORITY_HEADERS_ENTERPRISE_ID,
  AUTHORITY_HEADERS_USER_ID,
  AUTHORITY_HEADERS_DEPARTMENT_ID,
  AUTHORITY_HEADERS_ROLE
} from "../const/authorityheaders";
import { User } from "../model/user";
import { UserService } from "../service/userservice";
import { ROLE_ADMIN } from "../const/role";

export class DepartmentController extends BaseController {
  static async getDepartmentsInfo(req: any, res: Response, next: NextFunction): Promise<void> {
    const departmentIds: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    try {
      const departments = await DepartmentService.getDepartmentsByIds(departmentIds);
      next(new SuccessResponse({ departments }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  /**
   * 获取部门级联数据
   * @param req request
   * @param res response
   * @param next express nextFunction
   */
  static async getDepartmentsCascader(req: any, res: Response, next: NextFunction): Promise<void> {
    // FIXME 角色是admin时应当查出当前企业的所有部门
    let departmentIDs: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    
    try {
      const data = await DepartmentService.getDepartmentsCascader(departmentIDs);
      next(new SuccessResponse({ data }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async getSubDepartment(req: any, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const parentId: number = req.query["parent_id"] ? validator.toNumber(req.query["parent_id"], "invalid parent") : undefined;
    const neededAll: string = req.query["need_all"] ? validator.toStr(req.query["need_all"], "invalid need_all") : undefined;
    const userId: number = req[AUTHORITY_HEADERS_USER_ID];
    const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];
    const departmentIDs: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    const isAdmin: boolean = req[AUTHORITY_HEADERS_ROLE] === ROLE_ADMIN;
    const isNeededAll: boolean = neededAll === "true";

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      let info = await DepartmentService.getSubDepartmentInfo(parentId, enterpriseId, isNeededAll);
      if (!isAdmin) {
        info.departments = info.departments.filter((department) => departmentIDs.includes(department.departmentId));
        info.users = info.users.filter((user) => user.userId === userId);
      }
      next(new SuccessResponse(info));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async addDepartment(req: any, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const parentId: number = req.body["parentId"] ? validator.toNumber(req.body["parentId"]) : undefined;
    const name: string = validator.toStr(req.body["name"]);
    const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    const department = new Department();
    department.departmentName = name;
    department.enterpriseId = enterpriseId;
    department.hasUsers = false;
    department.childDepartments = [];
    department.parentDepartments = [];

    try {
      const id: number = await DepartmentService.addDepartment(department, parentId);
      next(new SuccessResponse({ id }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }

  }

  static async updateDepartment(req: any, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const id: number = validator.toNumber(req.params["id"]);
    const name: string = validator.toStr(req.body["name"]);

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const department = new Department();
      department.departmentName = name;
      await DepartmentService.updateDepartmentById(id, department);
      next(new SuccessResponse({ id }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async removeDepartment(req: any, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const id: number = validator.toNumber(req.params["id"]);
    const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const canDelete: boolean = await DepartmentService.canDepartmentDelete(id, enterpriseId);
      if (!canDelete) {
        next(new RemoveDepartmentFailResponse());
        return;
      }
      await DepartmentService.removeDepartment(id, enterpriseId);
      next(new SuccessResponse({ id }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async getSubDepartmentsByUserId(req: any, res: Response, next: NextFunction): Promise<void> {
    const userId: number = req[AUTHORITY_HEADERS_USER_ID];
    const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];

    try {
      let user: Department & User = await DepartmentService.getSubDepartmentsByUserId(userId);
      user = await UserService.getAdminDepartments(user);
      const departments: Department[] = await DepartmentService.getDepartmentsIdAndParent(user.childDepartments, enterpriseId);
      const relation = departments.map((ele: Department) => `${ele.parentId > 0 ? ele.parentId : "null"}:${ele.departmentId}`).join(",");
      next(new SuccessResponse({
        relation,
        displayName: user.displayName,
        childDepartmentsHaveUser: user.childDepartmentsHaveUser.map(Number),
        childDepartments: user.childDepartments.map(Number)
      }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }
}
