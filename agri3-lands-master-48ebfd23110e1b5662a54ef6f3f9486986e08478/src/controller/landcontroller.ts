import { Validator, BadRequestResponse, SuccessResponse, AuthErrorResponse, ErrorResponse } from "sakura-node-3";
import { BaseController, Request, Response, NextFunction } from "../base/basecontroller";
import { LandService } from "../service/landservice";
import { Land } from "../model/land";
import { HAS_PAGINATION_PAGE, HAS_PAGINATION_SIZE, PAGINATION_PAGE, PAGINATION_SIZE } from "../middleware/pagination";
import { SystemErrorResponse } from "../base/systemerrorresponse";
import { GeometryService } from "../service/geometryservice";
import {
  AUTHORITY_HEADERS_USER_ID,
  AUTHORITY_HEADERS_ENTERPRISE_ID,
  AUTHORITY_HEADERS_CURRENT_DEPARTMENT,
  AUTHORITY_HEADERS_DEPARTMENT_ID,
  AUTHORITY_HEADERS_DISPLAY_NAME,
  AUTHORITY_HEADERS_RELATION
} from "../const/authorityheaders";
import { AUTH_FAILED_NO_PRIVILEGE } from "../const/authorityerror";
import mvt from "../service/mvt";
import { LandRepository } from "../repository/landrepository";
import { CSVService } from "../service/csvservice";

export class LandController extends BaseController {

  /**
   * 查询地块数据
   */
  static async getLands(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const query: string = req.query["query"] ? validator.toStr(req.query["query"]) : undefined;
    let departmentId: any = req.query["department"] ? validator.toNumber(req.query["department"]) : 0;
    validator.assert(!isNaN(departmentId), "invalid department");
    const sortType: string = req.query["sort_type"] ? validator.toStr(req.query["sort_type"]).toUpperCase() : "DESC";
    const model: string = req.query["model"] ? validator.toStr(req.query["model"]) : "";
    const minSize = req.query["min_size"];
    const maxSize = req.query["max_size"];

    if (sortType !== undefined && sortType !== null && sortType !== "") {
      validator.assert(sortType === "ASC" || sortType === "DESC", "invalid sortType");
    }

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    if (departmentId !== 0 && departmentWithPrivilege.indexOf(departmentId) === -1) {
      next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
      return;
    }

    if (departmentId === 0) {
      departmentId = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    }
    departmentId = getChildIDs(departmentId, req[AUTHORITY_HEADERS_RELATION]);
    try {
      const results = await LandService.getLands(
        departmentId, query, req[HAS_PAGINATION_PAGE],
        req[HAS_PAGINATION_SIZE], req[PAGINATION_PAGE], req[PAGINATION_SIZE], sortType, model,
        minSize ? Number(minSize) : null, maxSize ? Number(maxSize) : null
      );

      next(new SuccessResponse(results));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  /**
   * 查询地块中心点、名称、面积、ID、权属人 pbf
   */
  static async getDataLayer(req: Request, res: Response, next: NextFunction): Promise<void> {
    const x = Number(req.params["x"]);
    const y = Number(req.params["y"]);
    const z = Number(req.params["z"]);
    const tableName = `${process.env.DB_SCHEMA}.lands`;
    let departmentID = Number(req.query["department"]);

    if (departmentID === 0 || isNaN(departmentID)) {
      departmentID = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    }
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    if (departmentID !== 0 && departmentWithPrivilege.indexOf(departmentID) === -1) {
      next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
      return;
    }
    const departmentIDs = getChildIDs(departmentID, req[AUTHORITY_HEADERS_RELATION]);
    const pbfFields = [
      "id", "land_name", "land_owner", "land_input_area"
    ];
    const pbfWheres = {
      "is_deleted": false,
      "enterprise_id": req[AUTHORITY_HEADERS_ENTERPRISE_ID],
      "department_id": departmentIDs
    };
    const pbf = await mvt(
      tableName, "ST_SetSRID(ST_GeomFromGeoJSON(land_center::TEXT), 4236)", "lands",
      x, y, z, pbfFields, pbfWheres, 1024, null, true
    );

    if (pbf === null) {
      res.end();
    } else {
      res.end(pbf);
    }
  }

  static async getGeojson(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    let departmentId: any = req.query["department"] ? [validator.toNumber(req.query["department"])] : 0;
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    validator.assert(!isNaN(departmentId), "invalid department");

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    if (departmentId !== 0 && departmentWithPrivilege.indexOf(departmentId) === -1) {
      next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
      return;
    }

    if (departmentId === 0) {
      departmentId = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    }

    try {
      const results: any = await LandService.getGeojson(departmentId);

      // to fulfill the requirements of iOS, to respond the geosjon without any wrapper
      res.set("Content-Type", "application/json; charset=utf-8");
      if (!results.features) {
        results.features = [];
      }
      res.end(JSON.stringify(results));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async getBoundary(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const x = validator.toNumber(req.params["x"], `invalid x`);
    const y = validator.toNumber(req.params["y"], `invalid y`);
    const z = validator.toNumber(req.params["z"], `invalid z`);
    const tableName = `${process.env.DB_SCHEMA}.village_boundary`;

    // const pbf: Buffer = await MvtService.queryTileAsPbf({
    //   x, y, z, additionalOptions: {
    //     queryTables: [tableName]
    //   }
    // });
    // res.end(pbf);
    const pbf = await mvt(tableName, "geometry", "lands", x, y, z, "id, name", null, 1024, null, true);

    if (pbf === null) {
      res.end();
    } else {
      res.end(pbf);
    }
  }

  static async getTiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const x = validator.toNumber(req.params["x"], `invalid x`);
    const y = validator.toNumber(req.params["y"], `invalid y`);
    const z = validator.toNumber(req.params["z"], `invalid z`);
    const tableName = `${process.env.DB_SCHEMA}.lands`;
    let departmentID = Number(req.query["department"]);

    if (departmentID === 0 || isNaN(departmentID)) {
      departmentID = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    }
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    if (departmentID !== 0 && departmentWithPrivilege.indexOf(departmentID) === -1) {
      next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
      return;
    }
    const departmentIDs = getChildIDs(departmentID, req[AUTHORITY_HEADERS_RELATION]);

    const pbfFields = [
      "id", "land_crop", "land_name", "land_owner", "land_input_area", "land_measured_area",
      "geojson", "land_remark", "ridge_count", "ridge_length", "created_by", "land_center", "created_at"
    ];
    const pbfWheres = {
      "is_deleted": false,
      "enterprise_id": req[AUTHORITY_HEADERS_ENTERPRISE_ID],
      "department_id": departmentIDs
    };
    const pbf = await mvt(tableName, "geometry", "lands", x, y, z, pbfFields, pbfWheres, 1024, null, true);

    if (pbf === null) {
      res.end();
    } else {
      res.end(pbf);
    }
  }

  static async contouringLand(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    const departmentId: any = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];
    const userId: number = req[AUTHORITY_HEADERS_USER_ID];
    const createdPerson: string = req[AUTHORITY_HEADERS_DISPLAY_NAME];
    const measureSize: number = validator.toNumber(req.body["measureSize"], "invalid measureSize");
    const landCenter: string = req.body["landCenter"];
    const geojson: any = req.body["landGeojson"];
    validator.assert(geojson.type.toLowerCase() === "polygon", "invalid landGeojson");
    const geometry: any = GeometryService.processGeojson(geojson);
    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }
    const isAddMethod: boolean = req.method.toLowerCase() === "post";
    let id: number = isAddMethod ? -1 : validator.toNumber(req.params["id"]);

    const landModel: Land = new Land();

    try {
      if (!isAddMethod) {
        const hasPrivilege: boolean = await LandService.hasPrivilegeInLand(id, departmentWithPrivilege);
        if (!hasPrivilege) {
          next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
          return;
        }
      }
      landModel.geojson = geojson;
      landModel.geometry = geometry;
      landModel.landCenter = landCenter;
      landModel.landMeasuredArea = measureSize;
      if (isAddMethod) {
        landModel.createdBy = createdPerson;
        landModel.departmentId = departmentId;
        landModel.enterpriseId = enterpriseId;
        landModel.userId = userId;
        landModel.landRemark = "";
        landModel.owner = "";
        landModel.ridgeCount = 0;
        landModel.ridgeLength = 0;
        landModel.crop = "";
        landModel.landInputArea = measureSize;
        id = await LandService.addLand(landModel);
      } else {
        await LandService.updateLandById(id, landModel);
      }
      await LandService.updateLandUserDisplayName(userId, createdPerson);

      await LandRepository.getLandByID(id).then((data) => {
        next(new SuccessResponse({ ...data, createdAt: new Date(data.createdAt * 1000), updatedAt: new Date(data.updatedAt * 1000) }));
      });
      // await MvtService.notifyFeatureChange(id, { srid: 4326, queryTables: [`${process.env.DB_SCHEMA}.lands`] });
      // next(new SuccessResponse({ id, createdAt: new Date() }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async updateLandInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    // const departmentId: any = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    // const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];
    const userId: number = req[AUTHORITY_HEADERS_USER_ID];
    const displayName: string = req[AUTHORITY_HEADERS_DISPLAY_NAME];
    const id: number = validator.toNumber(req.params["id"], "invalid land id");
    const inputSize: number = req.body["inputSize"] ? validator.toNumber(req.body["inputSize"], "invalid inputSize") : undefined;
    const crop: string = req.body["crop"] ? validator.toStr(req.body["crop"], "invalid crop") : undefined;
    const remark: string = req.body["remark"] ? validator.toStr(req.body["remark"], "invalid remark") : undefined;
    const landName: string = req.body["landName"] ? validator.toStr(req.body["landName"], "invalid landName") : undefined;
    const ridgeCount: number = req.body["ridgeCount"] ? validator.toNumber(req.body["ridgeCount"], "invalid ridgeCount") : undefined;
    const ridgeLength: number = req.body["ridgeLength"] ? validator.toNumber(req.body["ridgeLength"], "invalid ridgeLength") : undefined;
    const owner: string = req.body["owner"] ? validator.toStr(req.body["owner"], "invalid owner") : undefined;

    // FIXME 调整为容易理解的判断
    validator.assert(!id || !isNaN(id), "invalid land id");// tslint:disable-line
    validator.assert(!ridgeCount || !isNaN(ridgeCount), "invalid land ridgeCount");// tslint:disable-line
    validator.assert(!ridgeLength || !isNaN(ridgeLength), "invalid land ridgeLength");// tslint:disable-line

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }
    const landModel: Land = new Land();
    landModel.landInputArea = inputSize;
    landModel.crop = crop;
    landModel.landRemark = remark;
    landModel.ridgeCount = ridgeCount;
    landModel.ridgeLength = ridgeLength;
    landModel.name = landName;
    landModel.owner = owner;
    try {
      const hasPrivilege: boolean = await LandService.hasPrivilegeInLand(id, departmentWithPrivilege);
      if (!hasPrivilege) {
        next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
        return;
      }
      await LandService.updateLandUserDisplayName(userId, displayName);
      await LandService.updateLandById(id, landModel);
      // await MvtService.notifyFeatureChange(id, { srid: 4326, queryTables: [`${process.env.DB_SCHEMA}.lands`] });
      next(new SuccessResponse({ id }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async deleteLandById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    const validator: Validator = new Validator();
    const id: number = validator.toNumber(req.params["id"], "invalid land id");
    validator.assert(!isNaN(id), "invalid land id");
    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const hasPrivilege: boolean = await LandService.hasPrivilegeInLand(id, departmentWithPrivilege);
      if (!hasPrivilege) {
        next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
        return;
      }
      await LandService.deleteLandById(id);
      // await MvtService.notifyFeatureChange(id, { srid: 4326, queryTables: [`${process.env.DB_SCHEMA}.lands`] });
      next(new SuccessResponse({ id }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async getLandStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    let departmentIds: any = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    const department: number = req.query["department"] ? validator.toNumber(req.query["department"], "invalid department") : req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    validator.assert(!isNaN(department), "invalid department");
    const isQueryChildren = req.query["type"] === "child";

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    if (department !== undefined && departmentIds.indexOf(department) === -1) {
      next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
      return;
    }

    if (department !== undefined && department > 0) {
      if (isQueryChildren) {
        departmentIds = getChildIDs(department, req[AUTHORITY_HEADERS_RELATION]);
        departmentIds = departmentIds.length > 0 ? departmentIds : [department];
      }
    }

    try {
      let allInfos: any[] = await LandService.getLandStatistics(departmentIds);
      const firstLayer = getChildIDs(department, req[AUTHORITY_HEADERS_RELATION], 1);
      const firstLayerDepartments = isQueryChildren && firstLayer.length > 0 ? firstLayer : [department];
      let info = firstLayerDepartments.map((ele: number) => {
        const childIds = getChildIDs(ele, req[AUTHORITY_HEADERS_RELATION]);
        const childrenHasLand = [];
        let totalSize = 0;
        let totalArea = 0;
        let minLat = 999;
        let minLon = 999;
        let maxLat = -999;
        let maxLon = -999;
        let centerLat = 0;
        let centerLon = 0;

        for (let childId of childIds) {
          for (let childInfo of allInfos) {
            if (childInfo["departmentId"] === childId) {
              totalSize += childInfo["totalSize"]; 
              totalArea += childInfo["totalArea"]; 
              minLat = Math.min(childInfo["bounds"]["minLat"], minLat); 
              minLon = Math.min(childInfo["bounds"]["minLon"], minLon); 
              maxLat = Math.max(childInfo["bounds"]["maxLat"], maxLat); 
              maxLon = Math.max(childInfo["bounds"]["maxLon"], maxLon);
              childrenHasLand.push(childId);
            }
          }
        }
        totalArea = Math.round(totalArea * 100) / 100;
        totalSize = Math.round(totalSize * 100) / 100;
        centerLat = (minLat + maxLat) / 2;
        centerLon = (minLon + maxLon) / 2;
        let hasChildren = childrenHasLand.length > 1;

        return {
          totalSize,
          totalArea,
          hasChildren,
          bounds: {
            minLat,
            minLon,
            maxLat,
            maxLon
          },
          center: {
            lat: centerLat,
            lon: centerLon
          },
          departmentId: ele
        }
      }).filter((ele: any) => ele.totalSize > 0);

      if (info.length > 1) {
        info = info.filter((item: any) => {
          return department !== item.departmentId;
        }).sort((a, b) => a.departmentId - b.departmentId);
      }

      next(new SuccessResponse({ info }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  /**
   * 获取基于地块数据计算出的中心点
   */
  static async getLandsDepartmentCenter(req: Request, res: Response, next: NextFunction): Promise<void> {
    const searchType = req.param("type", "self");
    const isQuerySelf = searchType === "self";
    const isQueryChild = searchType === "child";

    if (!["self", "child"].includes(searchType)) {
      res.status(404).end();
      return;
    }

    if (isNaN(Number(req.query["department"])) || Number(req.query["department"]) % 1 !== 0) {
      next(new ErrorResponse("invalid department", 403));
      return;
    }
    let queryDepartmentID = Number(req.query["department"]);

    if (queryDepartmentID === 0) {
      queryDepartmentID = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    }

    let inputDepartmentIDs: number[];
    if (isQuerySelf) {
      inputDepartmentIDs = [queryDepartmentID];
    } else if (isQueryChild) {
      const childs = getChildIDs(queryDepartmentID, req[AUTHORITY_HEADERS_RELATION], 1);
      inputDepartmentIDs = childs.length > 1 ? [...childs] : [queryDepartmentID];
    }
    const data: { [x: number]: number[] } = {};
    const promiseArr = inputDepartmentIDs.map(async (departmentID) => {
      return LandRepository.getLandsCenter(
        req[AUTHORITY_HEADERS_RELATION][departmentID]
          ? getChildIDs(departmentID, req[AUTHORITY_HEADERS_RELATION])
          : [departmentID]
      ).then((center) => {
        if (center !== null) {
          data[departmentID] = center;
        }
      });
    });


    await Promise.all(promiseArr).then(() => {
      const keys = Object.keys(data);
      if (isQueryChild && keys.length > 1) {
        delete data[queryDepartmentID];
      }
      next(new SuccessResponse({ data: isQuerySelf ? data[queryDepartmentID] : data }));
    });
  }

  /**
   * 获取部门地块面积统计
   */
  static async getLandsDepartmentArea(req: Request, res: Response, next: NextFunction): Promise<void> {
    let departmentID: number | string = req.query["department"];
    let childDepartmentIDs: number[];
    if (!isNaN(Number(departmentID)) && Number(departmentID) % 1 === 0 && Number(departmentID) > 0) {
      departmentID = Number(departmentID);
      childDepartmentIDs = getChildIDs(departmentID, req[AUTHORITY_HEADERS_RELATION], 1);
      if (childDepartmentIDs.length === 0) {
        // 如果此部门没有子部门使用此部门ID进行查询
        childDepartmentIDs.push(departmentID);
      }
    } else {
      childDepartmentIDs = [Number(req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT])];
    }

    const data: { [x: number]: number } = {};
    const promiseArr = childDepartmentIDs.map((childDepartmentID) => {
      return LandRepository.getLandArea(getChildIDs(childDepartmentID, req[AUTHORITY_HEADERS_RELATION]), null)
        .then((area) => {
          if (area > 0) {
            data[childDepartmentID] = area;
          }
        });
    });

    await Promise.all(promiseArr).then(() => {
      const keys = Object.keys(data);
      if (keys.length > 1) {
        delete data[Number(departmentID)];
      }
      next(new SuccessResponse({ data }));
    });
  }

  /**
   * 计算某部门下作物面积统计数据
   */
  static async getLandsDepartmentCrop(req: Request, res: Response, next: NextFunction): Promise<void> {
    let departmentID: number | string = req.query["department"];
    if (!isNaN(Number(departmentID)) && Number(departmentID) % 1 === 0 && Number(departmentID) > 0) {
      departmentID = Number(departmentID);
    } else {
      departmentID = Number(req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT]);
    }
    const departmentIDs = getChildIDs(departmentID, req[AUTHORITY_HEADERS_RELATION]);

    const data = (await LandRepository.getLandAreaGroupByCrop(departmentIDs)).map((item) => {
      if (item.crop === "") {
        item.crop = "其他";
      }
      item.area = Math.round(item.area * 100) / 100;
      return item;
    });

    next(new SuccessResponse({ data }));
  }

  /**
   * 获取包含地块的所有部门ID
   */
  static async getHasLandsDpartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const departmentIDs = req[AUTHORITY_HEADERS_DEPARTMENT_ID];

    await LandRepository.getLandsDepartments(departmentIDs).then((data) => {
      next(new SuccessResponse({ data }));
    });
  }

  /**
   * 获取导出地块所需数据for gateway
   */
  static async getExportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    const query: string = req.query["query"];
    const departmentID = req.query["department"] ? Number(req.query["department"]) : req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    const sortType: string = req.query["sort_type"] ? req.query["sort_type"] : "DESC";
    const ext: string = req.query["ext"] === "csv" ? "csv" : "geojson";
    const minSize = isNaN(Number(req.query["min_size"])) ? null : Number(req.query["min_size"]);
    const maxSize = isNaN(Number(req.query["max_size"])) ? null : Number(req.query["max_size"]);
    const needGeojson = ext === "geojson";

    if (departmentWithPrivilege.indexOf(departmentID) === -1) {
      next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
      return;
    }
    const departmentIDs = getChildIDs(departmentID, req[AUTHORITY_HEADERS_RELATION]);

    try {
      res.setHeader(`Content-disposition`, `attachment; filename=lands.${ext}`);
      res.setHeader("Content-Type", "application/octet-stream");
      let buffer;
      if (ext === "csv") {
        buffer = await LandService.exportLandBufferAsCSV(departmentIDs, query, sortType, needGeojson,
          minSize !== null ? Number(minSize) : null, maxSize !== null ? Number(maxSize) : null);
      } else {
        buffer = await LandService.exportLandBufferAsGeojson(departmentIDs, query, sortType, needGeojson,
          minSize !== null ? Number(minSize) : null, maxSize !== null ? Number(maxSize) : null);
      }
      res.send(buffer);

      // next(new SuccessResponse({ data }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }
}

/**
 * 从关系中获取与部门ID相关联的所有部门ID
 *
 * @param id 部门ID
 * @param relation 部门关系
 * @param childIDs 相关部门ID数组
 */
function getChildIDs(id: number, relation: number[][], layerLimit: number = 100, currentLayer = 0, childIDs: number[] = []) {
  if (childIDs.includes(id)) {
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
