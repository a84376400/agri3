import express from "express";
import timeout from "connect-timeout";
import bodyParser from "body-parser";
import multer from "multer";
import errorHandler from "../middleware/errorhandler";
import { corsAllowAll, haltOnTimedout, BadRequestResponse, ApiError } from "sakura-node-3";

import { Farmrecordcontroller } from "../controller/farmrecordcontroller";
import { tokenParser } from "../middleware/token";
import { pagination } from "../middleware/pagination";

const v1: express.Router = express.Router();

const PICTS_TMP_PATH: string = "/tmp/com.gago.farmrecords";
const userPictures = multer({ dest: PICTS_TMP_PATH, limits: { fieldSize: 1024 * 1024 * 50 } });

// -------------------------------1------------------------------------------
// Middleware (before request)
// -------------------------------------------------------------------------

v1.use(timeout("30s"));
v1.use(haltOnTimedout);
// v1.use(compression()); // default threshold is 1KB
v1.use(haltOnTimedout);
v1.use(corsAllowAll(["X-Requested-With", "Return-Status-Code", "HostRequire", "Token", "content-type", "token"]));
v1.use(haltOnTimedout);
v1.use(bodyParser.json()); // for parsing application/json
v1.use(haltOnTimedout);
v1.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => { // invalid JSON
  if (error) {
    res.json(new BadRequestResponse([new ApiError("Invalid JSON", error.message)]));
  }
});

v1.use(haltOnTimedout);
v1.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
v1.use(haltOnTimedout);
v1.use(tokenParser());
v1.use(haltOnTimedout);
v1.use(pagination);
v1.use(haltOnTimedout);

// according to the requirements of android team, to use post instead of put
v1.post("/farmrecords/:id",
  userPictures.fields([
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "videoCover", maxCount: 1 },
    { name: "pictures", maxCount: 9 }
  ]),
  Farmrecordcontroller.manageFarmrecord);

v1.post("/farmrecord",
  userPictures.fields([
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "videoCover", maxCount: 1 },
    { name: "pictures", maxCount: 9 }
  ]),
  Farmrecordcontroller.manageFarmrecord);

v1.get("/farmrecord/geojson", Farmrecordcontroller.getGeojson);
v1.delete("/farmrecords/:id", Farmrecordcontroller.deleteFarmRecordById);
v1.get("/farmrecord/all", Farmrecordcontroller.getAllFarmrecordsByQuery);
v1.get("/farmrecord/:id", Farmrecordcontroller.getFarmrecordById);

// -------------------------------------------------------------------------
// Middleware (after request)
// -------------------------------------------------------------------------
v1.use(errorHandler);

module.exports = v1;
