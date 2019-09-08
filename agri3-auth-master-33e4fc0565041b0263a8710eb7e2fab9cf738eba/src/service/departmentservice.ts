import { Department } from "../model/department";
import { DepartmentRepository } from "../repository/departmentrepository";
import { UserRepository } from "../repository/userrepository";
import { User } from "../model/user";

export interface DepartmentInfo {
  departmentId: number;
  departmentName: string;
}

export interface SubUser {
  userId: number;
  username: string;
  displayName: string;
  role: string;
}

export interface SubDepartmentInfo {
  users: SubUser[];
  departments: DepartmentInfo[];
}

export class DepartmentService {
  /**
   * 获取部门级联数据
   * @param departmentID 部门ID
   */
  static async getDepartmentsCascader(departmentIDs: number[]) {
    const departments = await DepartmentRepository.getDepartmentByIds(departmentIDs);

    return withChilds(getRoot(departments), departments);
  }

  static async addDepartment(department: Department, parentId: number): Promise<number> {
    const id = await DepartmentRepository.addDepartment(department, parentId);
    return id;
  }

  static async removeDepartment(departmentId: number, enterpriseId: number): Promise<void> {
    await DepartmentRepository.removeDepartment(departmentId, enterpriseId);
  }

  static async updateDepartmentById(departmentId: number, department: Department): Promise<void> {
    await DepartmentRepository.updateDepartmentById(departmentId, department);
  }

  static async canDepartmentDelete(departmentId: number, enterpriseId: number): Promise<boolean> {
    const canDelete: boolean = await DepartmentRepository.canDepartmentDelete(departmentId, enterpriseId);
    return canDelete;
  }

  static async getDepartmentById(departmentId: number, enterpriseId: number): Promise<Department> {
    const department = await DepartmentRepository.getDepartmentById(departmentId, enterpriseId);
    return department;
  }

  static async getDepartmentsByIds(ids: number[]): Promise<DepartmentInfo[]> {
    const departments = await DepartmentRepository.getDepartmentByIds(ids);
    const info = departments.map((department: Department) => {
      return {
        departmentId: department.departmentId,
        departmentName: department.departmentName,
        parentDepartmentId: department.parentId,
        childDepartments: department.childDepartments.map(Number)
      };
    });
    return info;
  }

  static async getDepartmentsIdAndParent(departmentIds: number[], enterpriseId: number): Promise<Department[]> {
    const departments: Department[] = await DepartmentRepository.getDepartmentsIdAndParent(departmentIds, enterpriseId);
    return departments;
  }

  static async getSubDepartmentsByUserId(userId: number): Promise<Department & User> {
    const departmentUser: Department & User = await DepartmentRepository.getSubDepartmentsByUserId(userId);

    departmentUser.childDepartments.push(departmentUser.departmentId);
    departmentUser.childDepartmentsHaveUser.push(departmentUser.departmentId);

    departmentUser.childDepartments = departmentUser.childDepartments.map(Number);
    departmentUser.childDepartmentsHaveUser = departmentUser.childDepartmentsHaveUser.map(Number);

    return departmentUser;
  }

  static async getDepartmentsByName(name: string, enterpriseId: number): Promise<Department[]> {
    const departments = await DepartmentRepository.getDepartmentsByName(name, enterpriseId);
    return departments;
  }

  static async getSubDepartmentInfo(departmentId: number, enterpriseId: number, needAll: boolean = false): Promise<SubDepartmentInfo> {
    const departments = await DepartmentRepository.getSubDepartments(departmentId, enterpriseId, needAll);
    const users = departmentId ? await UserRepository.findUsersByDepartment(departmentId) : [];// tslint:disable-line
    return {
      departments: departments.map((ele: Department) => {
        return {
          departmentId: ele.departmentId,
          departmentName: ele.departmentName,
          parentDepartmentId: ele.parentId
        };
      }),
      users: users.map((ele: User) => {
        return {
          userId: ele.userId,
          username: ele.username,
          displayName: ele.displayName,
          role: ele.role,
          dataAuthorityId: ele.dataAuthorityId,
          telephone: ele.telephone
        };
      })
    };
  }

  static async getAllDepartmentIds(): Promise<number[]> {
    const ids = await DepartmentRepository.getAllDepartmentIds();
    return ids;
  }
}

function getRoot(departments: Department[]): Department {
  const departmentRel: Map< number, number> = new Map();
  for (const department of departments) {
    if (department.parentId === null || department.parentId === undefined) {
      return department;
    }
    departmentRel.set(department.departmentId, department.parentId);
  }

  for (const department of departments) {
    if (!departmentRel.has(department.parentId)) {
      return department;
    }
  }

  return null;
}

function withChilds(root: Department, departments: Department[]): any {
  if (root === null) {
    return [];
  }

  const childs: Department[] = [];

  for (const department of departments) {
    if (department.parentId === root.departmentId) {
      childs.push(department);
    }
  }

  if (childs.length === 0) {
    return {
      value: `${root.departmentId}`,
      label: root.departmentName
    };
  }

  const childrenOptions = [];
  for (const child of childs) {
    childrenOptions.push(withChilds(child, departments));
  }

  return {
    value: `${root.departmentId}`,
    label: root.departmentName,
    children: childrenOptions
  };
}
