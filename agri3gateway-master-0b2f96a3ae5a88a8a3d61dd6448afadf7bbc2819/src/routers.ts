// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

import express, { Request, Response, NextFunction } from "express";
// import { check } from "express-validator/check";
import IndexController from "./controller/index";
import { AUTHORITY_HEADERS } from "./const/authorityheaders";
import errorHandler from "./middleware/errorhandler";
// import TrackController from "./controllers/track";

const router = express.Router();

// Add state to Express's Request Interface.
declare global {
  namespace Express {
    interface Request {
      state: any;
      [x: string]: any;
    }
  }
  interface StringIndexObject {
    [x: string]: any;
  }
}

/**
 * 服务调用头数据暂存
 */
router.use((req: Request, res: Response, next: NextFunction) => {
  const headers: { [x: string]: any } = {};
  for (const key of AUTHORITY_HEADERS) {
    let headerVal = req[key];
    if (typeof req[key] === "object") {
      headerVal = JSON.stringify(req[key]);
    }
    headers[key] = headerVal;
  }
  req.state = Object.assign({}, req.state, { headers });
  next();
});

router.get("/departments/cascader/has_lands", IndexController.departmentCascaderHasLands);
router.get("/departments/child/has_lands/:departmentID", IndexController.departmentChildHasLands);

/**
 * 错误捕获及数据输出中间件
 */
router.use(errorHandler);

export default router;
