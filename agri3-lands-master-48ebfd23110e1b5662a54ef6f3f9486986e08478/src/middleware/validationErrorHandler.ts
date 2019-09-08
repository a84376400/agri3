// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "sakura-node-3";
import { validationResult } from "express-validator/check";

/**
 * express-validator 错误输出中间件
 */
export default function validationErrorHandler(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { msg, param, location } = <{ msg: string; param: string; location: string }> errors.array({ onlyFirstError: true }).shift();
    next(new ErrorResponse(`${location}[${param}]: ${msg}`, 403));
    return;
  }
  next();
}
