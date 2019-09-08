import { DBClient, QueryResult } from "sakura-node-3";

const DEFAULT_SIZE: number = 10;

/**
 * 用来处理 mobile 和 web 的 pagination，同时会计算 total size
 * 可以和 middleware/pagination 一起使用
 */
export class PaginationService {
  /* tslint:disable:max-params ter-max-len */
  /**
   * 获取 mobile pagination 的结果
   * @param originalQuery 原本的 query
   * @param orderField 要排序的 field
   * @param orderType 排序的类型 "DESC" | "ASC"
   * @param hasBottomIndex 是否有 bottomIndex，有的话，代表要拿旧的数据
   * @param hasSize 是否有 size，没有的话，会有 DEFAULT_SIZE: 10
   * @param bottomIndex bottomIndex
   * @param size DEFAULT_SIZE: 10
   */
  public static async generateQueryWithMobilePagination(originalQuery: string, orderField: string, orderType: "DESC" | "ASC", hasBottomIndex: boolean, hasSize: boolean, bottomIndex: number, size: number): Promise<QueryResult> {
    const isRequireNewestData: boolean = !hasBottomIndex || bottomIndex === -1;
    const whereSql: string = !isRequireNewestData ? `WHERE row_num < ${bottomIndex}` : "";
    const nullPosition: string = orderType === "DESC" ? "LAST" : "FIRST";

    let processQuery: string = `
      WITH temp_table AS (${originalQuery}),
          filter_table AS (SELECT * FROM temp_table),
          rank_table AS (SELECT *, ROW_NUMBER() OVER (ORDER BY ${orderField} ${orderType} NULLS ${nullPosition}) AS row_num FROM filter_table)
      SELECT *, (
        SELECT count(1) FROM rank_table) as total_size FROM rank_table  ${whereSql}
    `;

    let querySize: number = DEFAULT_SIZE;
    if (hasSize) {
      querySize = size;
    }

    processQuery = `${processQuery} ORDER BY row_num ASC LIMIT ${querySize}`;
    return DBClient.getClient().query(processQuery);
  }

  /**
   * 获取 web pagination 的结果
   * @param originalQuery 原本的 query
   * @param orderField 要排序的 field
   * @param orderType 排序的类型 "DESC" | "ASC"
   * @param hasPage 是否有 page, 没有的话默认返回所有结果
   * @param hasSize 是否有 size, 没有的话默认返回所有结果
   * @param page page
   * @param size size
   */
  public static async generateQueryWithWebPagination(originalQuery: string, orderField: string, orderType: "DESC" | "ASC", hasPage: boolean, hasSize: boolean, page: number, size: number): Promise<QueryResult> {
    const limit: number = size;
    const offset: number = (page - 1) * size;
    const nullPosition: string = orderType === "DESC" ? "LAST" : "FIRST";

    let processQuery: string = originalQuery;
    processQuery = `WITH temp_table AS (${processQuery}) SELECT *, (SELECT count(1) FROM temp_table) AS total_size  FROM temp_table ORDER BY ${orderField} ${orderType}  NULLS ${nullPosition} `;
    if (hasPage && hasSize) {
      processQuery = `${processQuery} LIMIT ${limit} OFFSET ${offset}`;
    }
    return DBClient.getClient().query(processQuery);
  }
}
