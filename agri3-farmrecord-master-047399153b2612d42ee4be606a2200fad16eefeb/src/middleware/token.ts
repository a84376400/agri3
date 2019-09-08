import { AuthErrorResponse } from "sakura-node-3";
import express, { Request } from "express";
import url from "url";
import {
  AUTHORITY_HEADERS,
  AUTHORITY_HEADERS_DISPLAY_NAME,
  AUTHORITY_HEADERS_DEPARTMENT_ID,
  AUTHORITY_HEADERS_RELATION,
  AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME,
  AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID,
  AUTHORITY_HEADERS_USER_ID,
  AUTHORITY_HEADERS_TYPE,
  AUTHORITY_HEADERS_CURRENT_DEPARTMENT,
  AUTHORITY_HEADERS_ENTERPRISE_ID
} from "../const/authorityheaders";
import { AUTH_FAILED_NO_PRIVILEGE } from "../const/authorityerror";

interface TokenFilterOption {
  method: string;
  url: string;
}

/**
 * Token middleware for parsing token and add "userId" to express.Request.
 */
export function tokenParser(
  exceptions: TokenFilterOption[] = []): (req: Request, res: express.Response, next: express.NextFunction
  ) => void {

  return (req: Request, res: express.Response, next: express.NextFunction): void => {

    for (const exception of exceptions) {
      if (url.parse(req.url).pathname.match(exception.url) && exception.method === req.method) {
        next();
        return;
      }
    }

    const authData: {[x: string]: any} = {};

    for (const header of AUTHORITY_HEADERS) {
      if (!req.headers[header]) {// tslint:disable-line
        // console.log(header, req.headers[header]);
        next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
        return;
      }

      switch (header) {
        case AUTHORITY_HEADERS_DEPARTMENT_ID:
          authData[header] = JSON.parse(<string> req.headers[header]);
          break;
        case AUTHORITY_HEADERS_HAS_USER_DEPARTMENT_ID:
          authData[header] = JSON.parse(<string> req.headers[header]);
          break;
        case AUTHORITY_HEADERS_DISPLAY_NAME:
          authData[header] = Buffer.from(<string> req.headers[header], "hex").toString();
          break;
        case AUTHORITY_HEADERS_CURRENT_DEPARTMENT_NAME:
          authData[header] = Buffer.from(<string> req.headers[header], "hex").toString();
          break;
        case AUTHORITY_HEADERS_RELATION:
          const relation: {[x: number]: number[]} = {};

          (<string> req.headers[header]).split(",").forEach((item) => {
            const [parent, child] = item.split(":").map((v) => {
              return Number(v);
            });
            if (isNaN(parent)) {
              return;
            }

            if (!relation[parent]) {
              relation[parent] = [parent];
            }

            if (!isNaN(child)) {
              relation[parent].push(child);
            }
          });
          authData[header] = relation;
          break;
        case AUTHORITY_HEADERS_USER_ID:
          authData[header] = Number(req.headers[header]);
          break;
        case AUTHORITY_HEADERS_ENTERPRISE_ID:
          authData[header] = Number(req.headers[header]);
          break;
        case AUTHORITY_HEADERS_TYPE:
          authData[header] = Number(req.headers[header]);
          break;
        case AUTHORITY_HEADERS_CURRENT_DEPARTMENT:
          authData[header] = Number(req.headers[header]);
          break;
        default:
          authData[header] = req.headers[header];
      }
    }

    // console.log(`authData: ${JSON.stringify(authData)}`);
    Object.assign(req, authData);
    next();
  };
}
