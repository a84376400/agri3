import { Column, TableName, SqlFlag, SqlType, SqlDefaultValue, GGModel } from "sakura-node-3";

@TableName(`${process.env.DB_SCHEMA}.lands`)
export class Land extends GGModel {

  @Column("id", SqlType.BIGINT, SqlFlag.PRIMARY_KEY, "主键 ID", SqlDefaultValue.SERIAL())
  id: number;

  @Column("land_crop", SqlType.VARCHAR_255, SqlFlag.NULLABLE, "作物类型")
  crop: string;

  @Column("land_name", SqlType.VARCHAR_255, SqlFlag.NULLABLE, "地块名称")
  name: string;

  @Column("land_owner", SqlType.VARCHAR_255, SqlFlag.NULLABLE, "权属人")
  owner: string;

  @Column("department_id", SqlType.NUMERIC, SqlFlag.NULLABLE, "部门")
  departmentId: number;

  @Column("enterprise_id", SqlType.NUMERIC, SqlFlag.NULLABLE, "企业")
  enterpriseId: number;

  @Column("user_id", SqlType.NUMERIC, SqlFlag.NULLABLE, "用户")
  userId: number;

  @Column("geojson", SqlType.JSON, SqlFlag.NULLABLE, "geojson")
  geojson: any;

  @Column("geometry", SqlType.GEOMETRY, SqlFlag.NOT_NULL, "geometry")
  geometry: any;

  @Column("land_input_area", SqlType.NUMERIC, SqlFlag.NOT_NULL, "面积（亩）")
  landInputArea: number;

  @Column("land_measured_area", SqlType.NUMERIC, SqlFlag.NULLABLE, "测量面积")
  landMeasuredArea: number;

  @Column("land_remark", SqlType.VARCHAR_255, SqlFlag.NULLABLE, "备注")
  landRemark: string;

  @Column("ridge_count", SqlType.NUMERIC, SqlFlag.NOT_NULL, "垄数")
  ridgeCount: number;

  @Column("ridge_length", SqlType.NUMERIC, SqlFlag.NOT_NULL, "垄长")
  ridgeLength: number;

  @Column("created_by", SqlType.VARCHAR_255, SqlFlag.NULLABLE, "创建人")
  createdBy: string;

  @Column("land_center", SqlType.JSON, SqlFlag.NULLABLE, "地块中心点")
  landCenter: any;

}
