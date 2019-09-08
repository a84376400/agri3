import axios from "axios";
import { REQUEST_TYPE } from "../const/requesttype";

export class RequestUtils {

  private static getMethodStrByEnum_(type: REQUEST_TYPE): string {
    switch (type) {
      case REQUEST_TYPE.GET:
        return "GET";
      case REQUEST_TYPE.POST:
        return "POST";
      case REQUEST_TYPE.PUT:
        return "PUT";
      case REQUEST_TYPE.DELETE:
        return "DELETE";
      default:
        throw new Error("Request type is invalid");
    }
  }

  static async request(methodType: REQUEST_TYPE, url: string, data: any, requiredHeaders: any = {}): Promise<any> {
    try {
      const baseHeaders = {
        "Content-Type": "application/json"
      };
      const headers = Object.assign({}, baseHeaders, requiredHeaders);
      const method = RequestUtils.getMethodStrByEnum_(methodType);
      console.log(`[${method}] headers: ${JSON.stringify(headers)} url: ${url} data: ${JSON.stringify(data)}`);
      const fetchResponse = await axios({
        method,
        url,
        headers,
        data,
      });
      return fetchResponse.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
