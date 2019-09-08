import { LANDHOST, LANDPORT } from "../const/microServiceHost";
import Axios from "axios";

// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

const baseURL = `http://${LANDHOST}:${LANDPORT}/api/lands`;
/**
 * Land微服务API
 */
export default class Land {
  /**
   * 获取此用户可看的有地块的部门ID列表
   * @param headers 头数据
   */
  static async hasLandsDepartments(headers: StringIndexObject): Promise<number[]> {
    return Axios.get("/departments", {
      baseURL,
      headers
    }).then((res) => {
      const { data, error } = res.data;
      if (error) {
        throw new Error(error);
      }
      return data.data;
    }).catch((err) => {
      console.log(err);
      return [];
    });
  }

  /**
   * 获取子部门中心点
   * @param headers 头数据
   * @param departmentID 部门ID
   */
  static async childDepartmentsCenter(headers: StringIndexObject, departmentID: number): Promise<StringIndexObject> {
    // /api/lands/department_center/child?department=8
    return Axios.get("/department_center/child", {
      baseURL,
      headers,
      params: {
        department: departmentID
      }
    }).then((res) => {
      const { data, error } = res.data;
      if (error) {
        throw new Error(error);
      }
      return data.data;
    }).catch((err) => {
      console.log(err);
      return [];
    });
  }
}
