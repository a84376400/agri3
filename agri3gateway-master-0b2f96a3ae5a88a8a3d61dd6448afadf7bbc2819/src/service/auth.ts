import { AUTHHOST, AUTHPORT } from "../const/microServiceHost";
import Axios from "axios";

// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

const baseURL = `http://${AUTHHOST}:${AUTHPORT}/api/auth`;
/**
 * Auth微服务API
 */
export default class Auth {
  /**
   * 获取用户可查的部门级联数据
   * @param headers 头数据
   */
  static async departmentsCascader(headers: StringIndexObject): Promise<StringIndexObject> {
    return Axios.get("departments/cascader", {
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
   * 获取部门列表
   * @param headers 头数据
   */
  static async departments(headers: StringIndexObject): Promise<StringIndexObject[]> {
    return Axios.get("/departments?need_all=true", {
      baseURL,
      headers
    }).then((res) => {
      const { data, error } = res.data;
      if (error) {
        throw new Error(error);
      }
      return data.departments;
    }).catch((err) => {
      console.log(err);
      return [];
    });
  }
}
