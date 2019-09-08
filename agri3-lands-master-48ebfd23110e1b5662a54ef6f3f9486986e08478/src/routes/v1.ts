import express from "express";
import timeout from "connect-timeout";
import errorHandler from "../middleware/errorhandler";
import bodyParser from "body-parser";
import { corsAllowAll, haltOnTimedout, BadRequestResponse, ApiError } from "sakura-node-3";
import { LandController } from "../controller/landcontroller";
import { pagination } from "../middleware/pagination";
import { tokenParser } from "../middleware/token";
import { query, param } from "express-validator/check";
import { sanitizeQuery } from "express-validator/filter";
import validationErrorHandler from "../middleware/validationErrorHandler";

const v1: express.Router = express.Router();

// -------------------------------1------------------------------------------
// Middleware (before request)
// -------------------------------------------------------------------------

v1.use(timeout("30s"));
v1.use(haltOnTimedout);
// v1.use(compression()); // default threshold is 1KB
v1.use(haltOnTimedout);
v1.use(corsAllowAll(["X-Requested-With", "Return-Status-Code", "HostRequire", "Token", "content-type"]));
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
v1.use(pagination);
v1.use(haltOnTimedout);
v1.use(tokenParser());
v1.use(haltOnTimedout);

v1.get("/lands/boundary/:z/:x/:y", LandController.getBoundary);
v1.get("/lands/data_layer/:z/:x/:y", [
  param(["x", "y", "z"]).isInt(),
  query(["department", "must be int"]).optional({ checkFalsy: true }).isInt(),
  validationErrorHandler
], LandController.getDataLayer);
v1.get("/lands/map/:z/:x/:y", LandController.getTiles);

// to fulfill the requirements of iOS, to respond the geosjon without any wrapper
v1.get("/lands/department_center/:type", LandController.getLandsDepartmentCenter); // type in [self,child]
v1.get("/lands/department_area", LandController.getLandsDepartmentArea);
v1.get("/lands/department_crop", LandController.getLandsDepartmentCrop);
v1.get("/lands/departments", LandController.getHasLandsDpartments);
v1.get("/lands/geojson", LandController.getGeojson);
v1.get("/lands/statistics", [
  query(["department", "must be int"]).optional({ checkFalsy: true }).isInt(),
  query(["type", "must be child"]).optional({ checkFalsy: true }).isIn(["child"]),
  validationErrorHandler
], LandController.getLandStatistics);
v1.get("/lands", [
  query(["min_size", "must be number"]).optional({ checkFalsy: true }).isFloat(),
  query(["max_size", "must be number"]).optional({ checkFalsy: true }).isFloat(),
  validationErrorHandler
], LandController.getLands);
v1.get("/lands/export", [
  sanitizeQuery("query").escape(),
  query("department").optional({ checkFalsy: true }).isInt(),
  query("ext").isIn(["geojson", "csv"]),
  query("sort_type").optional({ checkFalsy: true }).isIn(["ASC", "DESC", "asc", "desc"]),
  query("min_size").optional({ checkFalsy: true }).isFloat(),
  query("max_size").optional({ checkFalsy: true }).isFloat(),
  validationErrorHandler
], LandController.getExportData);
v1.post("/lands/contouring", LandController.contouringLand);
v1.put("/lands/contouring/:id", LandController.contouringLand);
v1.put("/lands/:id", LandController.updateLandInfo);
v1.delete("/lands/:id", LandController.deleteLandById);

// -------------------------------------------------------------------------
// Middleware (after request)
// -------------------------------------------------------------------------
v1.use(errorHandler);

module.exports = v1;
