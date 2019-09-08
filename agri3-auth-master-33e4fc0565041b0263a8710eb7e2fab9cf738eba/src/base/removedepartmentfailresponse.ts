import { ErrorResponse } from "sakura-node-3";

export class RemoveDepartmentFailResponse extends ErrorResponse {
  message: string;
  constructor() {
    super("REMOVE_DEPARTMENT_FAILED", 400);
  }
}
