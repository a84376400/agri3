// Copyright 2016 Frank Lin (lin.xiaoe.f@gmail.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

import * as redis from "redis";

/**
/**
 * Wrapper of RedisClient.
 */
export class RedisHelper {

  // ---------- Basic ----------

  /**
   * Get value by key
   */
  static async get(key: string): Promise<string> {
    return new Promise<string>(((resolve: (value: string) => void, reject: (error?: any) => void) => {
      const client: redis.RedisClient = RedisHelper.createClient_();
      client.get(key, (err: Error | void, reply: string) => {
        client.quit();

        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    }));
  }

  /**
   * Set value with key
   */
  static async set(key: string, value: string, expiredAt?: number): Promise<void> {
    new Promise<void>((resolve: any, reject: any) => {
      if (expiredAt) {
        const client: redis.RedisClient = RedisHelper.createClient_();
        client.set(key, value, function(err: Error | void, reply: string) {
          if (err) {
            client.quit();
            return reject(err);
          } else {
            client.expireat(key, expiredAt);
            client.quit();
            return resolve();
          }
        });
      } else {
        const client: redis.RedisClient = RedisHelper.createClient_();
        client.set(key, value, function(err: Error | void, reply: string) {
          client.quit();
          if (err) {
            return reject(err);
          } else {
            return resolve();
          }
        });
      }
    });
  }

  /**
   * Expire key by duration
   */
  static expire(key: string, expire: number): void {
    const client: redis.RedisClient = RedisHelper.createClient_();
    client.expire(key, expire);
    client.quit();
  }

  // ---------- Auth ----------

  /**
   * Find privilege by given token.
   * @param token Token.
   */
  static async findPrivilegeInToken(token: string): Promise<any> {
    const privilegeStr = await RedisHelper.get(RedisHelper.tokenKeyInRedis_(token));
    return JSON.parse(privilegeStr);
  }

  /**
   * Save privilege to cache, key is token.
   * @param token Token.
   * @param privilege Privilege.
   */
  static async savePrivilegeWithToken(token: string, privilege: any): Promise<void> {
    const key: string = RedisHelper.tokenKeyInRedis_(token);
    try {
      await RedisHelper.set(key, JSON.stringify(privilege), RedisHelper.tokenExpiredTimestamp_());
    } catch (error) {
      console.log(error);
    }
  }

  // ---------- Private ----------

  /**
   * 根据配置文件创建链接
   */
  private static createClient_(): redis.RedisClient {
    return redis.createClient({
      host: process.env.REDIS_SERVICE_HOST,
      port: isNaN(Number(process.env.REDIS_SERVICE_PORT)) ? 6379 : Number(process.env.REDIS_SERVICE_PORT)
    });
  }

  private static tokenKeyInRedis_(token: string): string {
    return `token:${token}`;
  }

  /**
   * Expired data is 7 days later.
   * @returns {number}
   */
  private static tokenExpiredTimestamp_(): number {
    const today: Date = new Date();
    today.setDate(today.getDate() + 7);
    return Math.floor(today.getTime() / 1000);
  }
}
