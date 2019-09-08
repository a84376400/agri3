// Copyright 2016 Frank Lin (lin.xiaoe.f@gmail.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

import * as express from "express";
import { ParsedAsJson } from "../declarations/bodyparser";

/**
 * Someday we may migrate to koa or some other RESTful framework, so we give Request/Response a type alias.
 */
export type Request = express.Request & ParsedAsJson;
export type Response = express.Response;
export type NextFunction = express.NextFunction;

/**
 * Nothing but a controller subclass should inherits.
 */
export class BaseController { } // tslint:disable-line
