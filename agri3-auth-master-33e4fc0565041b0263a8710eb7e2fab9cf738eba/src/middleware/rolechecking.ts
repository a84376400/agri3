import { AuthErrorResponse } from "sakura-node-3";
import * as express from "express";
import { AUTHORITY_HEADERS_ROLE } from "../const/authorityheaders";
import { AUTH_FAILED_NO_PRIVILEGE } from "../const/authorityerror";
import { ROLE_ADMIN } from "../const/role";

export function checkAdminRole(req: any, res: express.Response, next: express.NextFunction): void {
  if (req[AUTHORITY_HEADERS_ROLE] === ROLE_ADMIN) {
    next();
  } else {
    next(new AuthErrorResponse(AUTH_FAILED_NO_PRIVILEGE, 401));
  }
}
