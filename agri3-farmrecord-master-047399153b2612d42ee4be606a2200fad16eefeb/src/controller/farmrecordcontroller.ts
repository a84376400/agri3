
const ffmpeg = require("ffmpeg"); // tslint:disable-line
const path = require("path"); // tslint:disable-line
import {
  Validator, BadRequestResponse, SuccessResponse,
  AuthErrorResponse
} from "sakura-node-3";
import { BaseController, Request, Response, NextFunction } from "../base/basecontroller";
import { FarmrecordService } from "../service/farmrecordservice";
import { BoxService } from "gago-cloud-service";
import { Farmrecord } from "../model/farmrecord";
import { SystemErrorResponse } from "../base/systemerrorresponse";
import {
  HAS_BOTTOM_INDEX,
  PAGINATION_SIZE,
  BOTTOM_INDEX,
  HAS_PAGINATION_SIZE,
  HAS_PAGINATION_PAGE,
  PAGINATION_PAGE
} from "../middleware/pagination";
import {
  AUTHORITY_HEADERS_DEPARTMENT_ID,
  AUTHORITY_HEADERS_ENTERPRISE_ID,
  AUTHORITY_HEADERS_TYPE,
  AUTHORITY_HEADERS_USER_ID,
  AUTHORITY_HEADERS_RELATION,
  AUTHORITY_HEADERS_CURRENT_DEPARTMENT,
  AUTHORITY_HEADERS_DISPLAY_NAME
} from "../const/authorityheaders";
import { AUTH_FAILED_NO_PRIVILEGE } from "../const/authorityerror";
import { parseDate, getChildIDs } from "../util";

export class Farmrecordcontroller extends BaseController {
  static async manageFarmrecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();

    const isAddMethod: boolean = !Boolean(req.params["id"]);
    let id: number = isAddMethod ? -1 : validator.toNumber(req.params["id"]);

    const recordLatitude: number = validator.toNumber(req.body["recordLatitude"], "invalid recordLatitude");
    const recordLongitude: number = validator.toNumber(req.body["recordLongitude"], "invalid recordLongitude");
    const recordText: string = req.body["recordText"] ? validator.toStr(req.body["recordText"]) : "";

    validator.assert(recordLatitude <= 90 && recordLatitude >= -90, "invalid recordLatitude");
    validator.assert(recordLongitude <= 180 && recordLongitude >= -180, "invalid recordLongitude");

    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    const currentDepartment: number = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    const enterpriseId: number = req[AUTHORITY_HEADERS_ENTERPRISE_ID];
    const userId: number = req[AUTHORITY_HEADERS_USER_ID];
    const userName: string = req[AUTHORITY_HEADERS_DISPLAY_NAME];

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    const reqFiles: any = (<any> req.files);

    let pictures: any[];
    let audio: Express.Multer.File;
    let video: Express.Multer.File;
    let videoCover: Express.Multer.File;

    if (reqFiles) {
      pictures = reqFiles["pictures"];
      audio = Array.isArray(reqFiles["audio"]) && reqFiles["audio"].length === 1 ? reqFiles["audio"][0] : null;
      video = Array.isArray(reqFiles["video"]) && reqFiles["video"].length === 1 ? reqFiles["video"][0] : null;
      videoCover = Array.isArray(reqFiles["videoCover"]) && reqFiles["videoCover"].length === 1 ? reqFiles["videoCover"][0] : null;
    }

    const prefix: string = `${userId}-${Math.random()}`;

    try {
      if (!isAddMethod) {
        const hasPrivilege: boolean = await FarmrecordService.hasPrivilegeInFarmrecord(id, departmentWithPrivilege);
        if (!hasPrivilege) {
          next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
          return;
        }
      }
      let existedPic: string[] = [];
      if (!isAddMethod && req.body["existedPic"]) {
        if (typeof req.body["existedPic"] === "string") {
          existedPic = JSON.parse(req.body["existedPic"]);
        } else if (Array.isArray(req.body["existedPic"])) {
          existedPic = req.body["existedPic"];
        }
      }

      const existedAudio: string = isAddMethod || !req.body["existedAudio"] ? "" : validator.toStr(req.body["existedAudio"]);

      let recordAudioUrl: string = existedAudio;
      let seconds: number;
      if (audio) {
        const wavfile = await loadAudio(audio.path);
        seconds = Number(wavfile.metadata.duration.seconds);
        const mp3Path = await processAudio(wavfile, audio.path);
        const { name } = path.parse(mp3Path);
        const ossFileName: string = `${prefix}-${name}`;
        const ossFilePath: string = `/agri3/${ossFileName}`;
        await BoxService.uploadFileToOss(mp3Path, "gago-data", ossFilePath);
        recordAudioUrl = `https://gago-data.oss-cn-beijing.aliyuncs.com/${ossFilePath}`;
      }

      let recordPictureUrls: string = existedPic.join(",");
      if (pictures) {
        const picUrlArray: string[] = existedPic;
        for (const picture of pictures) {
          const ossFileName: string = `${prefix}-${picture.originalname}`;
          const ossFilePath: string = `/agri3/${ossFileName}`;
          await BoxService.uploadFileToOss(picture.path, "gago-data", ossFilePath);
          picUrlArray.push(`https://gago-data.oss-cn-beijing.aliyuncs.com${ossFilePath}`);
        }
        recordPictureUrls = picUrlArray.join(",");
      }

      let videoUrl: string = null;
      let videoCoverUrl: string = null;
      if (video) {
        const ossFileName: string = `${prefix}-${video.originalname}`;
        const ossFilePath: string = `/agri3/${ossFileName}`;
        await BoxService.uploadFileToOss(video.path, "gago-data", ossFilePath);
        videoUrl = `https://gago-data.oss-cn-beijing.aliyuncs.com${ossFilePath}`;
      } else if (/^https:\/\/gago-data\.oss\.cn.*\.mp4$/.test(req.body["existedVideo"])) {
        videoUrl = req.body["existedVideo"];
      }
      if (videoCover) {
        const ossFileName: string = `${prefix}-${videoCover.originalname}`;
        const ossFilePath: string = `/agri3/${ossFileName}`;
        await BoxService.uploadFileToOss(videoCover.path, "gago-data", ossFilePath);
        videoCoverUrl = `https://gago-data.oss-cn-beijing.aliyuncs.com${ossFilePath}`;
      } else if (/^https:\/\/gago-data\.oss\.cn.*$/.test(req.body["existedVideoCover"])) {
        videoCoverUrl = req.body["existedVideoCover"];
      }

      const newRecord = new Farmrecord();
      newRecord.initAsNewFarmrecord(recordLatitude, recordLongitude, recordText,
        recordAudioUrl, seconds, recordPictureUrls, userId,
        userName, currentDepartment, enterpriseId, videoUrl, videoCoverUrl);
      if (isAddMethod) {
        id = await FarmrecordService.addFarmrecord(newRecord);
      } else {
        // FIXED 更新记录时不更改用户和部门
        newRecord.userId = null;
        newRecord.userName = null;
        newRecord.enterpriseId = null;
        newRecord.departmentId = null;
        await FarmrecordService.updateFarmrecord(id, newRecord);
      }
      next(new SuccessResponse({ id }));
    } catch (e) {
      console.log(e);
      next(new SystemErrorResponse("Save error"));
      return;
    }
  }

  static async getGeojson(req: Request, res: Response, next: NextFunction): Promise<void> {

    const validator: Validator = new Validator();
    const department: number = req.query["department"] ? validator.toNumber(req.query["department"]) : undefined;
    const departmentIds: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    let queryDepartment: number[] = [];

    if (department) {
      validator.assert(departmentIds.includes(department), "invalid department");
      queryDepartment = getChildIDs(department, req[AUTHORITY_HEADERS_RELATION]);
    }

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const geojson = await FarmrecordService.getFarmrecordAllGeojson(queryDepartment);
      if (req.query["platform"] && req.query["platform"] === "ios") {
        res.json(geojson.geojson || []);
      } else {
        next(new SuccessResponse(geojson));
      }
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
      return;
    }
  }

  static async getFarmrecordById(req: Request, res: Response, next: NextFunction): Promise<void> {

    const validator: Validator = new Validator();
    const queryId: number = validator.toNumber(req.params["id"]);
    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }
    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];

    try {
      const hasPrivilege: boolean = await FarmrecordService.hasPrivilegeInFarmrecord(queryId, departmentWithPrivilege);
      if (!hasPrivilege) {
        next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
        return;
      }
      let farmrecord: any = await FarmrecordService.getFarmrecordById(queryId);
      farmrecord = {
        ...JSON.parse(JSON.stringify(farmrecord)),
        createdAt: new Date(farmrecord.createdAt * 1000),
        updatedAt: new Date(farmrecord.updatedAt * 1000)
      };
      next(new SuccessResponse({ farmrecord }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
      return;
    }
  }

  static async deleteFarmRecordById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const validator: Validator = new Validator();
    const id: number = validator.toNumber(req.params["id"]);

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];

    try {
      const hasPrivilege: boolean = await FarmrecordService.hasPrivilegeInFarmrecord(id, departmentWithPrivilege);
      if (!hasPrivilege) {
        next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
        return;
      }
      await FarmrecordService.deleteFarmRecordById(id);
      next(new SuccessResponse({ id }));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
    }
  }

  static async getAllFarmrecordsByQuery(req: Request, res: Response, next: NextFunction): Promise<void> {

    const queryStart: Date = parseDate(req.query["start"]);
    const queryEnd: Date = parseDate(req.query["end"]);

    const validator: Validator = new Validator();

    let departmentId: number = req.query["department"] ? validator.toNumber(req.query["department"]) : 0;
    const enterpriseId: number = req.query["enterprise"] ? validator.toNumber(req.query["enterprise"])
      : req[AUTHORITY_HEADERS_ENTERPRISE_ID];
    const query: string = req.query["query"] ? validator.toStr(req.query["query"]) : undefined;
    const sortType: string = req.query["sort_type"] ? validator.toStr(req.query["sort_type"]).toUpperCase() : "DESC";
    const type: string = req.query["type"] || "mobile";
    const paginationOption: any = {
      type,
      sortType: sortType || "DESC", // tslint:disable-line
      hasBottomIndex: req[HAS_BOTTOM_INDEX],
      hasSize: req[HAS_PAGINATION_SIZE],
      bottomIndex: req[BOTTOM_INDEX],
      size: req[PAGINATION_SIZE],
      hasPage: req[HAS_PAGINATION_PAGE],
      page: req[PAGINATION_PAGE],
    };

    const departmentWithPrivilege: number[] = req[AUTHORITY_HEADERS_DEPARTMENT_ID];
    if (departmentId !== 0 && departmentWithPrivilege.indexOf(departmentId) === -1) {
      next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
      return;
    }

    if (departmentId === 0) {
      departmentId = req[AUTHORITY_HEADERS_CURRENT_DEPARTMENT];
    }
    const departmentIDs = getChildIDs(departmentId, req[AUTHORITY_HEADERS_RELATION]);

    if (sortType) {// tslint:disable-line
      validator.assert(sortType === "ASC" || sortType === "DESC", "invalid sortType");
    }

    if (validator.hasErrors()) {
      next(new BadRequestResponse(validator.errors));
      return;
    }

    try {
      const result = await FarmrecordService.getFarmrecordByQuery(
        enterpriseId,
        departmentIDs,
        query,
        queryStart,
        queryEnd === null ? null : new Date(queryEnd.getTime() + 24 * 60 * 60 * 1000),
        paginationOption
      );
      next(new SuccessResponse(result));
    } catch (err) {
      console.log(err);
      next(new SystemErrorResponse());
      return;
    }
  }

}

/**
 * 加载音频文件
 * @param audioPath 音频路径
 */
async function loadAudio(audioPath: string): Promise<any> {
  try {
    return await new ffmpeg(audioPath);
  } catch (e) {
    console.log(e.code);
    console.log(e.msg);
  }
}

/**
 * 音频格式转换
 * @param process 音频数据
 * @param audioPath 音频文件路径
 */
async function processAudio(process: any, audioPath: string): Promise<string> {
  try {
    return new Promise<string>((resolve, reject) => {
      const { dir, name } = path.parse(audioPath);
      process.fnExtractSoundToMP3(`${dir}/${name}.mp3`, (error: any, file: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(file);
        }
      });
    });
  } catch (e) {
    console.log(e.code);
    console.log(e.msg);
  }
}
