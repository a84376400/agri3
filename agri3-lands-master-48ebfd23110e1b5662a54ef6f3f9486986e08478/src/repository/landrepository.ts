// import { PaginationService } from "../service/paginationservice";
import { QueryResult, SelectQuery, DBClient, Model, UpdateQuery, InsertQuery } from "sakura-node-3";
import { Land } from "../model/land";
import { PaginationService } from "../service/paginationservice";
/* tslint:disable:max-params */
export class LandRepository {
  static async hasPrivilegeInLand(landId: number, departmentIds: number[]): Promise<boolean> {
    const whereVal: string = departmentIds.map((id: number) => `(${id})`).join(",");
    const query: SelectQuery = new SelectQuery().select(["1"])
      .fromClass(Land).where(`department_id= ANY(VALUES ${whereVal}) AND id=${landId} AND is_deleted=false`);
    const results: QueryResult = await DBClient.getClient().query(query);
    return results.rowCount > 0;
  }

  static getLandWhereQueries(departmentId: any, query: string, minSize: number | null = null, maxSize: number | null = null): string {
    const whereSqls: string[] = [
      "is_deleted=false",
    ];

    if (departmentId) {
      if (Array.isArray(departmentId)) {
        whereSqls.push(`department_id in (${departmentId.join(",")})`);
      } else {
        whereSqls.push(`department_id = ${departmentId}`);
      }
    }

    if (!(query === null || query === "" || query === undefined)) {
      whereSqls.push(`(land_owner like '%${query}%' OR land_name like '%${query}%') AND NOT land_owner='' AND NOT land_name=''`);
    }

    if (minSize !== null) {
      whereSqls.push(`land_input_area > ${minSize}`);
    }
    if (maxSize !== null) {
      whereSqls.push(`land_input_area < ${maxSize}`);
    }
    console.log(whereSqls);
    return whereSqls.join(" AND ");
  }

  static async getLandArea(departmentId: any, query: string): Promise<number> {
    const whereSql: string = LandRepository.getLandWhereQueries(departmentId, query);

    const selectQuery: SelectQuery = new SelectQuery()
      .fromClass(Land)
      .select(["SUM(land_measured_area) AS total_area"])
      .where(whereSql);
    // console.log("getLandArea", selectQuery);
    const results: QueryResult = await DBClient.getClient().query(selectQuery);
    return Math.round(Number(results.rows[0]["total_area"]) * 100) / 100;
  }


  static async getLandBounds(departmentId: any, query: string): Promise<any> {
    const whereSql: string = LandRepository.getLandWhereQueries(departmentId, query);

    const selectQuery: SelectQuery = new SelectQuery()
      .fromClass(Land)
      .select(["bounds(st_union(geometry)) AS all_bounds"])
      .where(whereSql);
    const results: QueryResult = await DBClient.getClient().query(selectQuery);
    const bounds = results.rows[0]["all_bounds"];
    return {
      minLat: bounds[1],
      maxLat: bounds[3],
      minLon: bounds[0],
      maxLon: bounds[2]
    };
  }

  static async getLands(
    departmentId: any, query: string, hasPage: boolean, hasSize: boolean,
    page: number, size: number, sortType: string,
    minSize: number | null = null, maxSize: number | null = null
  ): Promise<QueryResult> {
    const whereSql: string = LandRepository.getLandWhereQueries(departmentId, query, minSize, maxSize);

    const selectQuery: SelectQuery = new SelectQuery()
      .fromClass(Land)
      .select([
        "id", "land_crop", "land_name", "land_input_area", "land_measured_area", "land_remark", "ridge_count", "ridge_length",
        "created_by", "created_at", "land_center", "geojson", "department_id", "enterprise_id", "user_id", "land_owner"
      ])
      .where(whereSql);
    const queryStr: string = DBClient.getClient().queryToString(selectQuery);

    const results: QueryResult = await PaginationService.generateQueryWithWebPagination(
      queryStr, "id", sortType, hasPage, hasSize, page, size
    );
    return results;
  }

  static async deleteLandById(id: number): Promise<void> {
    const model = new Land();
    model.isDeleted = true;
    const query = new UpdateQuery().fromModel(model).where(`id=${id}`);
    await DBClient.getClient().query(query);
  }

  static async updateLandById(id: number, model: Land): Promise<void> {
    const query = new UpdateQuery().fromModel(model).where(`id=${id}`);
    await DBClient.getClient().query(query);
  }

  static async addLand(land: Land): Promise<number> {
    let queryStr: string = DBClient.getClient().queryToString(new InsertQuery().fromModel(land));
    const geometryData: string = queryStr.match(/ST_GeomFromGeoJSON\(\'(.*?)\'\)/)[1];
    queryStr = queryStr.replace(/ST_GeomFromGeoJSON\(\'[\d\D]+\'\)/g, `ST_SetSRID(ST_GeomFromGeoJSON('${geometryData}'), 4326)`);
    const results: QueryResult = await DBClient.getClient().query(queryStr);
    if (results.rowCount === 0) {
      return -1;
    }
    return results.rows[0]["id"];
  }

  static async updateLandUserDisplayName(userId: number, displayName: string): Promise<void> {
    const land: Land = new Land();
    land.createdBy = displayName;
    const query = new UpdateQuery().fromModel(land).where(`user_id=${userId} AND NOT created_by='${displayName}'`);
    await DBClient.getClient().query(query);
  }

  static async getLandById(landId: number): Promise<Land> {
    const query: SelectQuery = new SelectQuery().fromClass(Land)
      .select(["land_name", "land_owner"]).where(`is_deleted=false  AND id=${landId}`);
    const results: QueryResult = await DBClient.getClient().query(query);
    if (results.rowCount === 0) {
      return undefined;
    }
    const land = Model.modelFromRow<Land>(results.rows[0], Land);
    return land;
  }

  /**
   * 获取地块统计信息
   * @param departmentIds 部门IDs
   * @param group 分组
   */
  static async getLandStatistics(departmentIds: number[]): Promise<QueryResult> {
    const rawSql = `SELECT department_id, SUM(land_input_area) AS total_area,
    BOUNDS( ST_UNION(ST_SetSRID(ST_GeomFromGeoJSON(land_center::text),4326)) ) AS land_bound,
    COUNT(1) AS total_size FROM lands WHERE is_deleted = false AND department_id in (${departmentIds.join(",")})
    GROUP BY department_id`;
    const results: QueryResult = await DBClient.getClient().query(rawSql);
    return results;
  }

  static async getLandGeojson(departmentIds: number[]): Promise<any> {
    const whereVal = departmentIds.map((ele: number) => `(${ele})`).join(",");

    // if the departments is empty, it won't respond any data
    const departmentSql = departmentIds.length === 0 ? `AND is_deleted=true` : `AND department_id=ANY(VALUES ${whereVal})`;

    const query = `SELECT json_build_object(
          'type', 'FeatureCollection',
          'crs',  json_build_object(
              'type',      'name',
              'properties', json_build_object('name', 'urn:ogc:def:crs:OGC:1.3:CRS84')),
          'features', json_agg(
              json_build_object(
                  'type',       'Feature',
                  'landId',         id,
                  'geometry',   land_center,
                  'properties', json_build_object(
                      'id', id,
                      'name', land_name,
                      'inputArea', land_input_area,
                      'owner', land_owner
                  )
              )
          )
      ) as geojson
      FROM lands
      WHERE is_deleted=false ${departmentSql};`;
    const results: QueryResult = await DBClient.getClient().query(query);
    return results.rows[0]["geojson"];
  }

  static async getLandByID(landID: number): Promise<Land> {
    const rawSql = `SELECT * FROM lands WHERE id = ${landID}`;
    return DBClient.getClient().query(rawSql).then(({ rows }) => {
      if (rows.length === 0) {
        return null;
      }
      return Model.modelFromRow(rows[0], Land);
    });
  }

  /**
   * 计算部门所有地块的中心点
   * @param departmentIDs 地块的部门ID
   */
  static async getLandsCenter(departmentIDs: number[]): Promise<number[]> {
    const rawSql = `SELECT ST_AsGeoJSON(ST_Centroid(ST_Collect(array_agg(ST_SetSRID(ST_GeomFromGeoJSON(land_center::text),4326)))))
    AS center FROM lands WHERE department_id in (${departmentIDs.join(",")}) AND is_deleted = false;`;
    // console.log("getLandsCenter", rawSql);

    return DBClient.getClient().query(rawSql).then(({ rows }) => {
      if (rows.length === 0 || rows[0]["center"] === null) {
        return null;
      }
      const { coordinates } = JSON.parse(rows[0]["center"]);
      return coordinates;
    }).catch((err) => {
      console.log(err);
      return null;
    });
  }

  /**
   * 统计部门内以作物分类的面积
   * @param departmentIDs 部门IDs
   */
  static async getLandAreaGroupByCrop(departmentIDs: number[]): Promise<Array<{ crop: string; area: number; year: string }>> {
    const rawSql = `SELECT SUM(land_input_area) AS area,land_crop AS crop,to_char(created_at, 'YYYY') AS year FROM
     lands WHERE is_deleted=false AND department_id in (${departmentIDs.join(",")}) GROUP BY land_crop, to_char(created_at, 'YYYY');`;

    return DBClient.getClient().query(rawSql).then(({ rows }) => {
      return <Array<{ crop: string; area: number; year: string }>>rows;
    });
  }

  /**
   * 筛选出有地块的部门ID
   * @param departmentIDs 部门IDs
   */
  static async getLandsDepartments(departmentIDs: number[]): Promise<number[]> {
    const rawSql = `SELECT COUNT(1) AS ln, department_id FROM lands
    WHERE department_id in (${departmentIDs.join(",")}) GROUP BY department_id;`;
    return DBClient.getClient().query(rawSql).then(({ rows }) => {
      console.log(rows);
      return rows.filter((row) => {
        return Number(row["ln"]) > 0;
      }).map((item) => {
        return Number(item["department_id"]);
      });
    }).catch((err) => {
      console.log(err);
      return [];
    });
  }

  /**
   * 获取导出地块所需数据
   * @param departmentIDs 部门范围
   * @param query 关键字
   * @param sortType 排序
   * @param needGeojson 是否需要geojson
   * @param minSize 最小面积
   * @param maxSize 最大面积
   */
  static async getExportLandsData(
    departmentIDs: number[], query: string, sortType: string,
    needGeojson: boolean, minSize: number, maxSize: number
  ): Promise<Land[]> {
    const queryStr: string = LandRepository.getExportDBQuery(departmentIDs, query, sortType, needGeojson, minSize, maxSize);
    const results = await DBClient.getClient().query(queryStr);
    return Model.modelsFromRows(results.rows, Land);
  }

  /**
   * 获取导出地块所需数据
   * @param departmentIDs 部门范围
   * @param query 关键字
   * @param sortType 排序
   * @param needGeojson 是否需要geojson
   * @param minSize 最小面积
   * @param maxSize 最大面积
   */
  static async getExportDataAsGeojson(
    departmentIDs: number[], query: string, sortType: string,
    needGeojson: boolean, minSize: number, maxSize: number
  ): Promise<any> {
    const landQuery: string = LandRepository.getExportDBQuery(departmentIDs, query, sortType, true, minSize, maxSize).replace(";", "");
    const geojsonQuery = `
      WITH query_land AS (${landQuery})
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'crs',  json_build_object(
            'type',      'name',
            'properties', json_build_object('name', 'urn:ogc:def:crs:OGC:1.3:CRS84')),
        'features', json_agg(
            json_build_object(
                'type',       'Feature',
                'geometry',   geojson,
                'properties', json_build_object(
                    'crop', land_crop,
                    'name', land_name,
                    'inputArea', land_input_area,
                    'measuredArea', land_measured_area,
                    'owner', land_owner
                )
            )
        )
    ) as geojson
    FROM query_land;
    `

    const results = await DBClient.getClient().query(geojsonQuery);
    let jsonObj = results.rows[0]["geojson"];
    if (!jsonObj.features) {
      jsonObj.features = [];
    }
    return JSON.stringify(jsonObj);
  }


  /**
   * 获取导出地块所需 query
   * @param departmentIDs 部门范围
   * @param query 关键字
   * @param sortType 排序
   * @param needGeojson 是否需要geojson
   * @param minSize 最小面积
   * @param maxSize 最大面积
   */
  static getExportDBQuery(
    departmentIDs: number[], query: string, sortType: string,
    needGeojson: boolean, minSize: number, maxSize: number
  ): string {
    const whereSql: string = LandRepository.getLandWhereQueries(departmentIDs, query, minSize, maxSize);
    const fields = [
      "land_crop", "land_name", "land_input_area", "land_measured_area", "land_center", "department_id", "land_owner"
    ];

    if (needGeojson) {
      fields.push("geojson");
    }

    // 地块名称、地块部门、地块权属、测量面积、实际面积、作物类型、中心经度、中心纬度
    const selectQuery: SelectQuery = new SelectQuery()
      .fromClass(Land)
      .select(fields)
      .where(whereSql)
      .orderBy("land_name", "ASC");
    const queryStr: string = DBClient.getClient().queryToString(selectQuery);
    return queryStr;
  }
}
