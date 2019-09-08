import { Column, TableName, SqlFlag, SqlType, SqlDefaultValue, GGModel } from "sakura-node-3";
import * as crypto from "crypto";

@TableName("users")
export class User extends GGModel {

  @Column("user_id", SqlType.BIGINT, SqlFlag.PRIMARY_KEY, "用户ID", SqlDefaultValue.SERIAL())
  userId: number;

  @Column("role", SqlType.VARCHAR_255, SqlFlag.NOT_NULL, "用户角色")
  role: string;

  @Column("username", SqlType.VARCHAR_255, SqlFlag.NOT_NULL, "用户名称")
  username: string;

  @Column("telephone", SqlType.VARCHAR_255, SqlFlag.NOT_NULL, "手机号")
  telephone: string;

  @Column("display_name", SqlType.VARCHAR_255, SqlFlag.NOT_NULL, "显示名称")
  displayName: string;

  @Column("enterprise_id", SqlType.BIGINT, SqlFlag.NOT_NULL, "企业ID")
  enterpriseId: number;

  @Column("department_id", SqlType.BIGINT, SqlFlag.NULLABLE, "部门ID")
  departmentId: number;

  @Column("data_authority_id", SqlType.BIGINT, SqlFlag.NULLABLE, "数据权限") // 1=全部部门数据 2=所在部门及子部门数据 3=所在部门数据 4=仅自己数据
  dataAuthorityId: number;

  @Column("password", SqlType.VARCHAR_1024, SqlFlag.NOT_NULL, "密码")
  password: string;

  @Column("salt", SqlType.VARCHAR_255, SqlFlag.NOT_NULL, "加密KEY")
  salt: string;

  private encryptPassword(): void {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.password = User.encryptPassword(this.salt, this.originalPassword_);
  }

  static encryptPassword(salt: string, rawPassword: string): string {
    return crypto.pbkdf2Sync(rawPassword, salt, 20000, 512, "sha512").toString("hex");
  }

  /* tslint:disable:max-params */
  initNewUser(enterpriseId: number,
    displayName: string,
    originalPassword: string,
    telephone: string,
    departmentId: number,
    dataAuthorityId: number,
    role: string) {
    this.originalPassword_ = originalPassword;
    this.telephone = telephone;
    this.username = telephone;
    this.displayName = displayName;
    this.enterpriseId = enterpriseId;
    this.dataAuthorityId = dataAuthorityId;
    this.departmentId = departmentId;
    this.role = role;

    this.encryptPassword();
  }

  initPassword(originalPassword: string) {
    this.originalPassword_ = originalPassword;
    this.encryptPassword();
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
      telephone: this.telephone,
      displayName: this.displayName,
      enterpriseId: this.enterpriseId,
      departmentId: this.departmentId,
      dataAuthorityId: this.dataAuthorityId,
      dataAuthorityName: DataAuthority[this.dataAuthorityId] || DataAuthority[4],// tslint:disable-line
      role: this.role,
      createdAt: new Date(this.createdAt * 1000).toISOString()
    };
  }

}

enum DataAuthority {
  "全部部门数据" = 1,
  "所在部门及子部门数据" = 2,
  "所在部门数据" = 3,
  "仅自己数据" = 4
}
