// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

import { Response, Request, NextFunction } from "express";
import Auth from "../service/auth";
import Land from "../service/land";
import { SuccessResponse, ErrorResponse } from "sakura-node-3";

export default class IndexController {
  /**
   * 获取有地块的部门级联数据
   */
  static async departmentCascaderHasLands(req: Request, res: Response, next: NextFunction) {
    await Promise.all([
      Auth.departmentsCascader(req.state.headers),
      Land.hasLandsDepartments(req.state.headers)
    ]).then(([departmentCascader, departmentIDs]) => {
      const data = removeNoLandsDepartment([departmentCascader], departmentIDs).shift();
      next(new SuccessResponse({ data }));
    });
  }

  /**
   * 获取直属子部门列表中心点，没有子部门则返回自己的中心点，再没有就是空
   */
  static async departmentChildHasLands(req: Request, res: Response, next: NextFunction) {
    const rootDepartment = Number(req.param("departmentID"));
    if (isNaN(rootDepartment)) {
      next(new ErrorResponse("invalid departmentID", 403));
      return;
    }
    await Promise.all([
      Auth.departments(req.state.headers),
      Land.childDepartmentsCenter(req.state.headers, rootDepartment)
    ]).then(([departments, departmentCenter]) => {
      const data = departments.map((department) => {
        const center: number[] = departmentCenter[`${department.departmentId}`] ? departmentCenter[`${department.departmentId}`] : null;
        return { ...department, center };
      }).filter((department) => {
        return department.center !== null;
      });
      next(new SuccessResponse({ data }));
    });
  }
}

/**
 * 从部门级联数据过滤掉没有地块的部门
 * @param cascader 部门级联数据
 * @param departmentIDs 有地块的部门ID
 */
function removeNoLandsDepartment(cascader: StringIndexObject[], departmentIDs: number[]): StringIndexObject[] {
  const children = cascader.filter((department) => {
    if (department.children && department.children.length > 0) {
      department.children = removeNoLandsDepartment(department.children, departmentIDs);
    }
    return departmentIDs.includes(Number(department.value)) || (department.children && department.children.length > 0);
  });
  if (children.length > 0) {
    return children;
  }
  return undefined;
}
