import { Column, TableName, Model, SqlFlag, SqlType, SqlDefaultValue } from "sakura-node-3";

@TableName(`${process.env.DB_SCHEMA}.village_boundary`)
export class Boundary extends Model {

  @Column("id", SqlType.BIGINT, SqlFlag.PRIMARY_KEY, "主键 ID", SqlDefaultValue.SERIAL())
  id: number;

  @Column("name", SqlType.VARCHAR_255, SqlFlag.NOT_NULL, "村名称")
  name: string;

  @Column("geometry", SqlType.GEOMETRY, SqlFlag.NOT_NULL, "geometry")
  geometry: any;

}
