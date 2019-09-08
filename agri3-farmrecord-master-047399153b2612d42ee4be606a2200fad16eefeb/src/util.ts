// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

/**
 * 解析输入时间
 */
export function parseDate(input: number | string | Date): Date {
  if (input instanceof Date) {
    return input;
  }
  if (input === null || input === "" || input === undefined || typeof input === "object") {
    return null;
  }
  if (!isNaN(Number(input))) {
    const tmpDate = new Date(Number(input));

    if (tmpDate.getFullYear() < 2000) {
      return new Date(Number(input) * 1000);
    }
    return tmpDate;
  }
  if (typeof input === "string") {
    if (/^\d{4}(-\d{d}){2}$/.test(input)) {
      return new Date(`${input} 00:00:00+08`);
    }
    if (/^\d{4}(-\d{d}){2} \d{2}(:\d{2}){2}(\.\d+)?$/.test(input)) {
      return new Date(`${input}+08`);
    }
    const timestamp = Date.parse(input);

    return isNaN(timestamp) ? null : new Date(timestamp);
  }
  return null;
}

/**
 * 从关系中获取与部门ID相关联的所有部门ID
 *
 * @param id 部门ID
 * @param relation 部门关系
 * @param childIDs 相关部门ID数组
 */
export function getChildIDs(id: number, relation: number[][], layerLimit: number = 100, currentLayer = 0, childIDs: number[] = []) {
  if (childIDs.indexOf(id) >= 0) {
    // 防无限循环
    return childIDs;
  }
  childIDs.push(id);
  if (currentLayer >= layerLimit) {
    return childIDs;
  }
  if (relation[id]) {
    for (const childID of relation[id]) {
      getChildIDs(childID, relation, layerLimit, currentLayer + 1, childIDs);
    }
  }
  return childIDs;
}
