import { Model } from "sakura-node-3";
import { Farmrecord } from "../model/farmrecord";
import { FarmrecordRepository } from "../repository/farmrecordrepository";

export class FarmrecordService {

  static async hasPrivilegeInFarmrecord(recordId: number, departmentIds: number[]): Promise<boolean> {
    const hasPrivilege: boolean = await FarmrecordRepository.hasPrivilegeInFarmrecord(recordId, departmentIds);
    return hasPrivilege;
  }

  static async addFarmrecord(farmrecord: Farmrecord): Promise<number> {
    const result = await FarmrecordRepository.addFarmrecord(farmrecord);
    return Number(result.rows[0]["id"]);
  }

  static async updateFarmrecord(id: number, farmrecord: Farmrecord): Promise<void> {
    await FarmrecordRepository.updateFarmrecord(id, farmrecord);
  }

  static async getFarmrecordById(id: number): Promise<Farmrecord> {
    const result = await FarmrecordRepository.getFarmrecordById(id);
    if (result.rowCount === 1) {
      return Model.modelFromRow(result.rows[0], Farmrecord);
    }
    throw Error("FARMRECORD_INFO_NOT_EXISTS");
  }

  static async getFarmrecordAllGeojson(departmentIds: number[]): Promise<any> {
    const result = await FarmrecordRepository.getFarmrecordGeojson(departmentIds);
    if (result.rowCount === 1) {
      return result.rows[0];
    }
    throw Error("GEOJSON_FARMRECORD_INFO");
  }

  /* tslint:disable:max-params ter-max-len */
  static async getFarmrecordByQuery(enterpriseId: number, departmentIds: number[], query: string, start: Date, end: Date, paginationOptions: any): Promise<any> {
    const result = await FarmrecordRepository.getFarmrecordsByQuery(enterpriseId, departmentIds, query, start, end, paginationOptions);
    let totalSize = 0;
    const farmrecords: any[] = result.rows.map((ele: any) => {
      totalSize = Number(ele["total_size"]);
      const rowNum = Number(ele["row_num"]);
      // const updatedAt: Date = new Date(new Date(ele["updated_at"]).getTime() + 28800000);
      const url: string[] = ele["record_picture_urls"].split(",");
      return {
        id: Number(ele["id"]),
        recordLatitude: Number(ele["record_latitude"]),
        recordLongitude: Number(ele["record_longitude"]),
        recordText: ele["record_text"],
        recordAudioUrl: ele["record_audio_url"],
        recordAudioLen: Number(ele["record_audio_len"]),
        recordVideoUrl: ele["record_video_url"],
        recordVideoCoverUrl: ele["record_video_cover_url"],
        recordPictureUrls: url[0].length === 0 ? [] : url,
        userName: ele["user_name"],
        userId: Number(ele["user_id"]),
        // FIXME 时间问题
        createdAt: new Date(Date.parse(ele["created_at"])),
        updatedAt: new Date(Date.parse(ele["updated_at"])),
        rowNum: isNaN(rowNum) ? undefined : rowNum
      };
    });
    return { farmrecords, totalSize };
  }

  static async deleteFarmRecordById(id: number): Promise<void> {
    await FarmrecordRepository.deleteFarmRecordById(id);
  }
  //
  //
  // static async deleteFarmworksByLandId(landId: number): Promise<void> {
  //     await FarmworkRepository.deleteFarmworksByLandId(landId);
  // }
  // static async addFarmwork(farmwork: Farmwork): Promise<number> {
  //     const QueryResult = await FarmworkRepository.addFarmwork(farmwork);
  //     return Number(QueryResult.rows[0].id);
  // }
  //
  // static async updateFarmworkById(id: number, model: Farmwork): Promise<void> {
  //     await FarmworkRepository.updateFarmworkById(id, model);
  // }

}
