import { HttpResponse } from "sakura-node-3";

/* tslint:disable:naming-convention max-classes-per-file  */
export enum PiccStateCode {
  NO = -1,
  YES = 0,

  // 提示类自定义消息
  MSG_USER_PASSWORD_ERROR = 10001,    // 用户密码错误
  MSG_USER_ACCOUNT_NO_EXIST = 10002,    // 用户账号不存在
  MSG_USER_NOT_AUTHORITY = 10003,    // 用户没有权限
  MSG_VERIFICATION_CODE_ERROR = 10004,    // 验证码错误

  // 第三方账号错误
  ER_APPID_NO_EXIST = 20000,		// APPID不存在
  ER_APPID_EXPIRED = 20001,	        // 账号已过期
  ER_TOKEN_GENERATE_TOO_MANY = 20002,		// 今日生成token次数超限
  ER_MISSING_ACCESS_TOKEN = 20003,    // 第三方access_token丢失
  ER_FAILED_ACCESS_TOKEN = 20004,    // 第三方access_token验证失败
  ER_INVALID_INTERFACE = 20005,       // 第三方接口权限验证失败

  // 接口调用错误
  ER_MISSING_TOKEN = 30000,   // token丢失
  ER_FAILED_TOKEN = 30001,   // token验证失败
  ER_CLEANED_TOKEN = 30002,   // 超过30分钟未操作token被清除
  ER_PARAMS_ERROR = 30003,   // 参数错误
  ER_PARAMS_XSS_FAILED = 30004,   // 参数未通过xss验证
  ER_FILE_TYPE_INVALID = 30005,   // 无效的文件类型

  // 系统错误
  SYSTEM_INNER_ERROR = 40001,   // 系统内部错误

  // 服务器错误
  ER_SERVICE_ERROR = 50000,   // 服务器发生异常

  // 数据错误
  DATA_NOT_FOUND = 50001,   // 数据未找到
  DATA_IS_WRONG = 50002,   // 数据有误
  DATA_ALREADY_EXISTED = 50003,   // 数据已存在

  SUCCESS = 1, // 成功
  FAIL = 500,  // 失败
}

export class PiccResponse extends HttpResponse {
  code: number;
  message: string;
  data: any;
  displayCode: number;

  constructor(code: number, data: any = {}, httpCode: number = 200) {
    super(httpCode);
    this.code = httpCode;
    this.displayCode = code;
    this.message = PiccStateCode[code];
    this.data = data;

  }

  toJSON(): any {
    return {
      code: this.displayCode,
      message: this.message,
      data: this.data
    };
  }
}

export class PiccSuccessResponse extends PiccResponse {
  constructor(data: any) {
    super(PiccStateCode.SUCCESS, data);
  }
}

export class PiccBadRequestResponse extends PiccResponse {
  constructor(data: any) {
    super(PiccStateCode.DATA_IS_WRONG, data, 400);
  }
}

export class PiccAuthErrorResponse extends PiccResponse {
  constructor() {
    super(PiccStateCode.MSG_USER_NOT_AUTHORITY, {}, 401);
  }
}

export class PiccSystemErrorResponse extends PiccResponse {
  constructor(data: any = {}) {
    super(PiccStateCode.SYSTEM_INNER_ERROR, data, 500);
  }
}
