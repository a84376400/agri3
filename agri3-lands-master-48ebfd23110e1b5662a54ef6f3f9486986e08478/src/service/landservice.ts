import { QueryResult } from "sakura-node-3";
import { LandRepository } from "../repository/landrepository";
import { Land } from "../model/land";
import { CSVService } from "./csvservice";
/* tslint:disable:max-params */
export class LandService {

  static async hasPrivilegeInLand(landId: number, departmentIds: number[]): Promise<boolean> {
    const hasPrivilege: boolean = await LandRepository.hasPrivilegeInLand(landId, departmentIds);
    return hasPrivilege;
  }

  static async getLands(
    departmentId: any, query: string, hasPage: boolean, hasSize: boolean, page: number,
    size: number, sortType: string, model: string,
    minSize: number | null = null, maxSize: number | null = null
  ): Promise<any> {
    let totalSize = 0;
    const landsDetailPromise = LandRepository.getLands(
      departmentId, query, hasPage, hasSize, page, size, sortType, minSize, maxSize
    );
    let areaPromise = LandRepository.getLandArea(departmentId, query);
    let boundsPromise = LandRepository.getLandBounds(departmentId, query);
  
    let [results, totalArea, bounds] = await Promise.all([landsDetailPromise, areaPromise, boundsPromise]);

    const isSimpleModel: boolean = model === "simple";
    const lands = results.rows.map((ele: any) => {
      totalSize = Number(ele["total_size"]);
      if (isSimpleModel) {
        return {
          id: ele.id,
          name: ele["land_name"],
          inputArea: Number(ele["land_input_area"]),
          landCenter: ele["land_center"],
          owner: ele["land_owner"]
        };
      }

      return {
        id: ele.id,
        name: ele["land_name"],
        departmentId: Number(ele["department_id"]),
        remark: ele["land_remark"],
        measuredArea: Number(ele["land_measured_area"]),
        inputArea: Number(ele["land_input_area"]),
        crop: ele["land_crop"],
        ridgeCount: Number(ele["ridge_count"]),
        ridgeLength: Number(ele["ridge_length"]),
        createdBy: ele["created_by"],
        createdAt: ele["created_at"],
        geojson: ele["geojson"],
        landCenter: ele["land_center"],
        owner: ele["land_owner"]
      };
    });
    return { lands, totalSize, totalArea, bounds };
  }

  static async addLand(land: Land): Promise<number> {
    const id = await LandRepository.addLand(land);
    land.name = `地块 ${id}`;
    await LandService.updateLandById(id, land);
    return id;
  }

  static async updateLandUserDisplayName(userId: number, displayName: string): Promise<void> {
    await LandRepository.updateLandUserDisplayName(userId, displayName);
  }

  static async updateLandById(id: number, model: Land): Promise<void> {
    await LandRepository.updateLandById(id, model);
  }

  static async deleteLandById(id: number): Promise<void> {
    await LandRepository.deleteLandById(id);
  }

  static async getLandStatistics(departmentIds: number[]): Promise<any[]> {
    const results: any = await LandRepository.getLandStatistics(departmentIds);

    return results.rows.map((ele: any) => {
      const bounds: number[] = ele["land_bound"];
      return {
        bounds: {
          minLat: bounds[1],
          maxLat: bounds[3],
          minLon: bounds[0],
          maxLon: bounds[2]
        },
        center: {
          lat: (bounds[3] + bounds[1]) / 2,
          lon: (bounds[2] + bounds[0]) / 2,
        },
        totalSize: Number(ele["total_size"]),
        totalArea: Number(ele["total_area"]),
        departmentId: Number(ele["department_id"]),
      };
    });
  }

  static async getGeojson(departmentIds: number[]): Promise<any[]> {
    const geojson: any = await LandRepository.getLandGeojson(departmentIds);
    return geojson;
  }

  static async exportLandBufferAsCSV(departmentIDs: number[], query: string, sortType: string, needGeojson: boolean, minSize: number, maxSize: number): Promise<Buffer> {
    const data = await LandRepository.getExportLandsData(
      departmentIDs, query, sortType, needGeojson,
      minSize !== null ? Number(minSize) : null, maxSize !== null ? Number(maxSize) : null
    );
    let buffer = CSVService.convertObjToCSVBuffer(data, [
      { oriText: "name", replaceText: "地块名称" },
      { oriText: "owner", replaceText: "地块权属" },
      { oriText: "crop", replaceText: "作物类型" },
      { oriText: "landInputArea", replaceText: "测量面积" },
      { oriText: "landMeasuredArea", replaceText: "实际面积" },
    ]);
    return buffer;
  }

  static async exportLandBufferAsGeojson(departmentIDs: number[], query: string, sortType: string, needGeojson: boolean, minSize: number, maxSize: number): Promise<Buffer> {
    const data = await LandRepository.getExportDataAsGeojson(
      departmentIDs, query, sortType, needGeojson,
      minSize !== null ? Number(minSize) : null, maxSize !== null ? Number(maxSize) : null
    );
    let buffer = Buffer.from(data, "utf8");
    return buffer;
  }
}
