import {
  InsertQuery,
  DBClient,
  QueryResult,
  UpdateQuery,
  SelectQuery,
  Model,
  sqlContext, SqlField
} from "sakura-node-3";

/**
 * Handles CRUD of enterprise table. (Table name: "Model")
 */
export class BaseRepository {

  static async addByModel<T extends Model>(modelInstance: T): Promise<number> {
    const primaryKey: PrimaryKey = BaseRepository.getModelInstancePrimaryKey(modelInstance);
    if (!primaryKey) {
      throw new Error("INSERT_FAIL");
    }

    const sql: InsertQuery = new InsertQuery().fromModel(modelInstance);
    const result: QueryResult = await DBClient.getClient().query(sql);
    if (result.rows.length === 0) {
      throw new Error("INSERT_FAIL");
    }
    return result.rows[0][primaryKey.sqlPrimaryKey];
  }

  static async findByPrimaryKey<T extends Model>(type: { new(): T }, primaryKey: number): Promise<T> {
    const modelPrimaryKey: PrimaryKey = BaseRepository.getModelPrimaryKey(type);
    if (!modelPrimaryKey) {
      return null;
    }

    const sql: SelectQuery = new SelectQuery().select().fromClass(type).where(`${modelPrimaryKey.sqlPrimaryKey} = ${primaryKey}`);
    const result: QueryResult = await DBClient.getClient().query(sql);
    if (result.rows.length === 0) {
      return null;
    }
    const instance: T = Model.modelFromRow<T>(result.rows[0], type);
    return instance;
  }

  static async findAll<T extends Model>(type: { new(): T }): Promise<T[]> {
    const sql: SelectQuery = new SelectQuery().select().fromClass(type);
    const result: QueryResult = await DBClient.getClient().query(sql);
    return Model.modelsFromRows(result.rows, type);
  }

  private static getModelInstancePrimaryKey<T extends Model>(modelInstance: T): PrimaryKey {
    const model = modelInstance.constructor;
    const modelSqlFields: SqlField[] = sqlContext.findSqlFields(model);
    let sqlPrimaryKey: string = null;
    let modelPrimaryKey: string = null;
    for (const sqlField of modelSqlFields) {
      if (sqlField.flag === 0) {
        sqlPrimaryKey = sqlField.columnName;
        modelPrimaryKey = sqlField.name;
        break;
      }
    }
    if (sqlPrimaryKey !== null && modelPrimaryKey !== null) {
      return { sqlPrimaryKey, modelPrimaryKey };
    }
    return null;
  }

  private static getModelPrimaryKey<T extends Model>(model: { new(): T }): PrimaryKey {
    const modelSqlFields: SqlField[] = sqlContext.findSqlFields(model);
    let sqlPrimaryKey: string = null;
    let modelPrimaryKey: string = null;
    for (const sqlField of modelSqlFields) {
      if (sqlField.flag === 0) {
        sqlPrimaryKey = sqlField.columnName;
        modelPrimaryKey = sqlField.name;
        break;
      }
    }
    if (sqlPrimaryKey !== null && modelPrimaryKey !== null) {
      return { sqlPrimaryKey, modelPrimaryKey };
    }
    return null;
  }

  static async updateByPrimaryKey<T extends Model>(modelInstance: T): Promise<number> {
    const primaryKey: PrimaryKey = BaseRepository.getModelInstancePrimaryKey(modelInstance);
    if (primaryKey) {
      const sql: UpdateQuery = new UpdateQuery()
      .fromModel(modelInstance).where(`${primaryKey.sqlPrimaryKey} = ${modelInstance[primaryKey.modelPrimaryKey]}`);
      await DBClient.getClient().query(sql);
      return 1;
    }
    return 0;
  }
}

interface PrimaryKey {
  sqlPrimaryKey: string;
  modelPrimaryKey: string;
}
