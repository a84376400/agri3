const validator = /^[a-z0-9]{32}$/i;

/**
 * UUID 生成全局唯一 id
 */
export class UUID {
  private value: string;
  constructor(uuid: (string | UUID)) {
      if (!uuid) throw new TypeError("无效参数");
      this.value = UUID.EMPTY;

      if (!!uuid && uuid instanceof UUID) this.value = uuid.value;
      else if (!!uuid && typeof uuid === "string") this.value = uuid.toLowerCase();
    }

    /** 获取 uuid 值 */
  toString() {
      return this.value;
    }

  toJSON() {
      return this.value;
    }

    /** 判断 uuid 相等 */
  equals(value: string) {
      return UUID.isUUID(value) && (this.value === value || this.value === value.toLowerCase());
    }

    /** 判断是否为空 uuid */
  isEmpty() {
      return this.value === UUID.EMPTY;
    }

  static EMPTY = "00000000000000000000000000000000";

    /** 判断是否是合法 uuid */
  static isUUID(value: any) {
      return !!value && (value instanceof UUID || validator.test(value.toString()));
    }

    /** 生成新的 uuid 实体 */
  static create() {
      return new UUID(UUID.gen(8));
    }

    /** 生成新的 */
  static raw() {
      return UUID.gen(8);
    }

  private static gen(count: number) {
      let out = "";
      for (let i = 0; i < count; i++) {
          out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
      return out;
    }
}
