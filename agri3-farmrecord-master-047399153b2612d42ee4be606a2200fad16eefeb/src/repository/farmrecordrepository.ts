// import { PaginationService } from "../service/paginationservice";
import { QueryResult, SelectQuery, DBClient, InsertQuery, UpdateQuery } from "sakura-node-3";
import { Farmrecord } from "../model/farmrecord";
import { PaginationService } from "../service/paginationservice";

import format from "date-fns/format";

export class FarmrecordRepository {

  static async hasPrivilegeInFarmrecord(recordId: number, departmentIds: number[]): Promise<boolean> {
    const whereVal: string = departmentIds.map((id: number) => `(${id})`).join(",");
    const query: SelectQuery = new SelectQuery()
      .select(["1"]).fromClass(Farmrecord).where(`department_id= ANY(VALUES ${whereVal}) AND id=${recordId} AND is_deleted=false`);
    const results: QueryResult = await DBClient.getClient().query(query);
    return results.rowCount > 0;
  }

  // static getQueryOfUpdatingUserNameByUserId(userId: number, userName: string): string {
  //   let record = new Farmrecord();
  //   record.userName = userName;
  //   const query = new UpdateQuery().fromModel(record).where(`user_id=${userId} AND NOT user_name='${userName}'`);
  //   return DBClient.getClient().queryToString(query);
  // }

  static async addFarmrecord(farmrecord: Farmrecord): Promise<QueryResult> {
    const query = new InsertQuery().fromModel(farmrecord);
    let querySting: string = DBClient.getClient().queryToString(query);
    querySting = querySting.replace(") VALUES (", `,geometry) VALUES (`).replace(") RETURNING ", `,ST_GeomFromText('POINT(${farmrecord.recordLongitude} ${farmrecord.recordLatitude})', 4326)) RETURNING `);
    // await DBClient.getClient().query(FarmrecordRepository.getQueryOfUpdatingUserNameByUserId(farmrecord.userId, farmrecord.userName));
    return DBClient.getClient().query(querySting);
  }

  static async updateFarmrecord(id: number, farmrecord: Farmrecord): Promise<void> {
    const query = new UpdateQuery().fromModel(farmrecord).where(`id=${id} AND is_deleted=false`);
    let querySting: string = DBClient.getClient().queryToString(query);
    querySting = querySting.replace(" WHERE ",
      `,geometry=ST_GeomFromText('POINT(${farmrecord.recordLongitude} ${farmrecord.recordLatitude})', 4326)  WHERE `);
    await DBClient.getClient().query(querySting);
  }

  static async addFarmrecordThenUpdate(id: number): Promise<QueryResult> {
    const updateSql: string = ` UPDATE farmrecords SET geometry = ST_GeomFromText('POINT(' || record_longitude || ' ' || record_latitude || ')', 4326) WHERE id = ${id} ;`; // tslint:disable-line
    return DBClient.getClient().query(updateSql);
  }

  static async getFarmrecordById(id: number): Promise<QueryResult> {
    const query = new SelectQuery().fromClass(Farmrecord)
      .select()
      .where(`id=${id}`, `is_deleted=false`);
    return DBClient.getClient().query(query);
  }

  static async getFarmrecordGeojson(departmentIds: number[]): Promise<any> {
    const whereVal: string = departmentIds.map((id: number) => `(${id})`).join(",");
    const whereSql: string = departmentIds.length > 0 ? `AND department_id= ANY(VALUES ${whereVal})` : "";
    const query = ` SELECT json_build_object(
    'type', 'FeatureCollection',
    'crs',  json_build_object(
        'type',      'name',
        'properties', json_build_object('name', 'urn:ogc:def:crs:OGC:1.3:CRS84')),
    'features', json_agg(
        json_build_object(
            'type',       'Feature',
            'id',         id,
            'geometry',   ST_AsGeoJSON(geometry)::json,
            'properties', json_build_object(
                'id', id
            )
        )
    )
) as geojson
FROM farmrecords
WHERE is_deleted=false ${whereSql};
`;
    return DBClient.getClient().query(query);
  }

  /* tslint:disable:max-params */
  static async getFarmrecordsByQuery(
    enterpriseId: number,
    departmentIds: number[],
    query: string,
    start: Date,
    end: Date,
    paginationOptions: any
  ): Promise<QueryResult> {
    const whereSql = ["is_deleted=false"];
    const departmentWhereSql = departmentIds.map((ele: any) => `(${ele})`).join(",");

    if (enterpriseId) {// tslint:disable-line
      whereSql.push(`enterprise_id =  ${enterpriseId}`);
    }
    if (departmentIds.length > 0) {
      whereSql.push(`department_id=ANY(VALUES ${departmentWhereSql})`);
    }
    if (start) {
      whereSql.push(`created_at >= '${format(start)}'`);
    }
    if (end) {
      whereSql.push(`created_at <= '${format(end)}'`);
    }
    if (query) {// tslint:disable-line
      whereSql.push(`(user_name like '%${query}%' OR record_text like '%${query}%') AND NOT record_text='' AND NOT user_name=''`);
    }

    const selectQuery: SelectQuery = new SelectQuery()
      .fromClass(Farmrecord)
      .select([
        "id", "record_text", "record_audio_url", "record_audio_len", "record_picture_urls", "record_video_url",
        "record_video_cover_url", "user_name", "user_id", "record_latitude", "record_longitude", "updated_at", "created_at"
      ])
      .where(whereSql.join(" AND "));
    const sql: string = DBClient.getClient().queryToString(selectQuery);

    let results: QueryResult;
    if (paginationOptions.type === "mobile") {
      // results = await PaginationService.generateQueryWithMobilePagination(
      //   sql,
      //   "created_at",
      //   paginationOptions.sortType,
      //   paginationOptions.hasBottomIndex,
      //   paginationOptions.hasSize,
      //   paginationOptions.bottomIndex,
      //   paginationOptions.size
      // );

      results = await DBClient.getClient().query(`${sql} ORDER BY updated_at DESC`);
    } else {
      console.log(
        paginationOptions.sortType,
        paginationOptions.hasPage,
        paginationOptions.hasSize,
        paginationOptions.page,
        paginationOptions.size
      );
      results = await PaginationService.generateQueryWithWebPagination(
        sql,
        "created_at",
        paginationOptions.sortType,
        paginationOptions.hasPage,
        paginationOptions.hasSize,
        paginationOptions.page,
        paginationOptions.size
      );
      // sql = `${sql} ORDER BY updated_at DESC`;
      // results = await DBClient.getClient().query(sql);
    }

    return results;
  }

  static async deleteFarmRecordById(id: number): Promise<void> {
    const model = new Farmrecord();
    model.isDeleted = true;
    const query = new UpdateQuery().fromModel(model).where(`id=${id}`);
    await DBClient.getClient().query(query);
  }
}
