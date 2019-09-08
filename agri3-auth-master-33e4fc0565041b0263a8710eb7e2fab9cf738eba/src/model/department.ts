import { Column, TableName, SqlFlag, SqlType, SqlDefaultValue, GGModel } from "sakura-node-3";

@TableName("departments")
export class Department extends GGModel {

  @Column("department_id", SqlType.BIGINT, SqlFlag.PRIMARY_KEY, "department id", SqlDefaultValue.SERIAL())
  departmentId: number;

  @Column("department_name", SqlType.VARCHAR_255, SqlFlag.NULLABLE, "department name")
  departmentName: string;

  @Column("parent_department_id", SqlType.BIGINT, SqlFlag.NULLABLE, "parent department id")
  parentId: number;

  @Column("parent_departments", SqlType.JSON, SqlFlag.NULLABLE, "parent departments")
  parentDepartments: any;

  @Column("children_departments", SqlType.JSON, SqlFlag.NULLABLE, "children department")
  childDepartments: any;

  // @Column("parent_departments_have_users", SqlType.JSON, SqlFlag.NULLABLE, "parent departments")
  // hasUserParentDepartments: any;

  @Column("children_departments_have_users", SqlType.JSON, SqlFlag.NULLABLE, "children department")
  childDepartmentsHaveUser: any;

  @Column("enterprise_id", SqlType.BIGINT, SqlFlag.NOT_NULL, "企业ID")
  enterpriseId: number;

  @Column("has_users", SqlType.BOOLEAN, SqlFlag.NOT_NULL, "企业ID")
  hasUsers: boolean;

}
