import axios from "axios";
import { REQUEST_TYPE } from "../const/requesttype";
const request = require("request");
const fs = require("fs");

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

  static async uploadFile(url: string, fieldName: string, filePath: string, additionInfo: any = {}): Promise<any> {
    const formData: any = {
      ...additionInfo
    };
    formData[fieldName] = fs.createReadStream(filePath);
    return new Promise((resolve, reject) => {
      request.post({ timeout: 120000, url, formData }, (err: any, httpResponse: any, body: any) => {
        if (err) {
          return reject(err);
        }
        try {
          if (httpResponse.statusCode !== 200) {
            reject(JSON.parse(body));
            return;
          }
          resolve(JSON.parse(body));
          return;
        } catch (err) {
          reject(err);
          return;
        }
      });
    });
  }
}
