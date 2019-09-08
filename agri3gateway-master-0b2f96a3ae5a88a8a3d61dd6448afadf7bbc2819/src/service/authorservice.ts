import * as redis from "redis";
// import * as request from "request";
const request = require("request");
import { timestamp } from "sakura-node-3";
import { RedisClient } from "redis";
import { DATAAUTHHOST } from "../const/microServiceHost";
import { DATAAUTHPORT } from "../const/microServiceHost";

export interface DataAuthority {
  dataAuthorityId: number;
  departmentIds: number[];
  userId: number;
  enterpriseId: number;
}

export class Authorservice {

  // user_data_authority
  static async getDataAuthor(userId: number): Promise<DataAuthority> {
    const dataAuthemUrl: string = `http://${DATAAUTHHOST}:${DATAAUTHPORT}/api/user_data_authority/${userId}`;

    return new Promise<any>((resolve, reject) => {
      request(dataAuthemUrl, function(err: any, response: any, body: any) {
        if (!err && response.statusCode == 200) {
          const pbody = JSON.parse(body);
          if (pbody && pbody["data"]) {
            resolve(pbody["data"]);
          } else {
            reject("RES_BODY_ERROR");
          }
        } else {
          reject(err);
        }
      });

    });
  }

  static async savelocal(data: any): Promise<void> {
    const key: string = data.token;
    if (key) {
      this.set_(key, data);
    }
  }

  static async getlocal(key: string): Promise<string> {
    return new Promise<string>(((resolve: (value: string) => void, reject: (error?: any) => void) => {
      const client: redis.RedisClient = this.createClient_();
      // console.info(client.server_info);
      client.get(key, (err: Error | void, reply: string) => {
        client.quit();
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    }));
  }

  private static set_(key: string, value: string, expiredAt?: timestamp): void {
    if (expiredAt) {
      const client: redis.RedisClient = this.createClient_();
      client.set(key, value, function(err: Error | void, reply: string) {
        if (err) {
          client.quit();
          throw err;
        } else {
          client.expireat(key, expiredAt);
          client.quit();
          return;
        }
      });
    } else {
      const client: redis.RedisClient = this.createClient_();
      client.set(key, value, function(err: Error | void, reply: string) {
        client.quit();

        if (err) {
          throw err;
        } else {
          return;
        }
      });
    }
  }

  private static createClient_(): RedisClient {
    return redis.createClient({
      host: process.env.REDIS_SERVICE_HOST,
      port: isNaN(Number(process.env.REDIS_SERVICE_PORT)) ? 6379 : Number(process.env.REDIS_SERVICE_PORT)
    });  }
}
