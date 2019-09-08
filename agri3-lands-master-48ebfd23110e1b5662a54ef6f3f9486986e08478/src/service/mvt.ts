// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

import DB from "../service/database";
/**
 * 精简版MvtService for postgis on pg
 */
/* tslint:disable:max-params no-parameter-reassignment */
/**
 * 获取矢量瓦片数据
 * @param tableName 表名
 * @param geoColumn 地理信息列名
 * @param layer 前端对应图层
 * @param x x
 * @param y y
 * @param z z
 * @param fields pbf要带到列数据
 * @param wheres 查询条件
 * @param extend 瓦片栅格精度
 */
export default async function pbf(
  tableName: string,
  geoColumn: string,
  layer: string,
  x: number,
  y: number,
  z: number,
  fields: string | string[] = "*",
  wheres: string | { [x: string]: any } = null,
  extend: number = 4096,
  buffer: number = null,
  clipGeom: boolean = false
) {
  if (fields === "*") {
    console.warn("fields better not '*'");
  } else {
    if (typeof fields === "string") {
      fields = fields.split(",");
    }
    if (!Array.isArray(fields)) {
      throw new Error("fields must be string or Array<string>");
    }
    const isfieldsSafe = fields.every((field) => {
      return /^[a-z0-9A-Z_\.\s]+$/.test(field);
    });
    if (!isfieldsSafe) {
      throw new Error("fields check fail.only support a-z0-9A-Z_.");
    }
    fields = fields.join(",");
  }
  if (wheres !== null) {
    if (typeof wheres === "string") {
      // TODO 安全校验
    } else if (typeof wheres === "object") {
      const wheresArr = [];
      for (let [f, v] of Object.entries(wheres)) {
        switch (typeof v) {
          case "boolean":
            wheresArr.push(`${f} = ${v.toString()}`);
            break;
          case "number":
            wheresArr.push(`${f} = ${v}`);
            break;
          case "string":
            wheresArr.push(`${f} = '${v}'`);
            break;
          case "object":
            if (Array.isArray(v)) {
              v = v.map((vv) => {
                if (typeof vv === "number") {
                  return vv;
                }
                if (typeof vv === "string") {
                  return `${vv}`;
                }
                return null;
              }).filter(vv => vv !== null);
              wheresArr.push(`${f} in (${v.join(",")})`);
            } else if (
              v.op && typeof v.op === "string"
              && ["<", "<=", ">", ">=", "LIKE", "NOT IN", "IS"].includes((v.op as string).toUpperCase())
            ) {
              wheresArr.push(`${f} ${v.op} ${v.value}`);
            }
            break;
          default:
        }
      }
      wheres = wheresArr.join(" AND ");
    }
  }
  if (buffer === null) {
    buffer = Math.floor(extend / 16);
  }

  const rawSql = `SELECT ST_AsMVT(q, '${layer}', ${extend}, 'geom') AS mvt FROM (
    SELECT ${fields},ST_AsMVTGeom(${geoColumn},TileBBox(${z}, ${x}, ${y}, 4326), ${extend}, ${buffer}, ${clipGeom.toString()}) AS geom
    FROM ${tableName} ${wheres === null ? "" : ` WHERE ${wheres}`}) AS q;`;

  return DB.query(rawSql).then(({ rows }) => {
    if (rows.length === 0) {
      return null;
    }
    return rows[0]["mvt"];
  });
}
