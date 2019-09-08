import express from "express";
import timeout from "connect-timeout";
import bodyParser from "body-parser";
import errorHandler from "../middleware/errorhandler";
import { corsAllowAll, haltOnTimedout, BadRequestResponse, ApiError } from "sakura-node-3";
import { DepartmentController } from "../controller/departmentcontroller";
import { UserController } from "../controller/usercontroller";
import { tokenParser } from "../middleware/token";
import { checkAdminRole } from "../middleware/rolechecking";
import { WeatherController } from "../controller/weathercontroller";
import { pagination } from "../middleware/pagination";

const withoutAuthRules: any[] = [
  { method: "POST", url: /login/ }
];

const v1: express.Router = express.Router();

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
v1.use(tokenParser(withoutAuthRules));
v1.use(haltOnTimedout);
v1.use(pagination);
v1.use(haltOnTimedout);

v1.post("/login", UserController.login);
v1.get("/departments/info", DepartmentController.getDepartmentsInfo);
v1.get("/departments/cascader", DepartmentController.getDepartmentsCascader);

// tmp
v1.get("/precipitations", WeatherController.getPrecipitation2h);

// for gateway
v1.get("/users/departments", DepartmentController.getSubDepartmentsByUserId);

v1.get("/users", checkAdminRole, UserController.getUsers);
v1.post("/users", checkAdminRole, UserController.addUser);

// modify password by admin
v1.put("/users/:id/password", checkAdminRole, UserController.modifyPassword);

// modify password by themselves
v1.put("/users/password", UserController.modifyPassword);

v1.put("/users/:id", checkAdminRole, UserController.updateUser);
v1.delete("/users/:id", checkAdminRole, UserController.removeUser);

v1.get("/departments", DepartmentController.getSubDepartment);
v1.post("/departments", checkAdminRole, DepartmentController.addDepartment);
v1.put("/departments/:id", checkAdminRole, DepartmentController.updateDepartment);
v1.delete("/departments/:id", checkAdminRole, DepartmentController.removeDepartment);

// -------------------------------------------------------------------------
// Middleware (after request)
// -------------------------------------------------------------------------
v1.use(errorHandler);

module.exports = v1;
