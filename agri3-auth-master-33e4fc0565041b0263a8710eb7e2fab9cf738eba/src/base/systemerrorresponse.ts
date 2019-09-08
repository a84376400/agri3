import { ErrorResponse } from "sakura-node-3";

export class SystemErrorResponse extends ErrorResponse {
  message: string;
  constructor(message: string = "system error", code: number = 500) {
    super(message, code);
    this.message = message;
    this.code = code;
  }
}
