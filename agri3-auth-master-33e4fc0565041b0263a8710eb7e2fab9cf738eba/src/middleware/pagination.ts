import { Response, NextFunction } from "../base/basecontroller";

export const BODY_BOTTOM_INDEX: string = "bottomIndex";
export const BODY_TOP_INDEX: string = "topIndex";
export const QUERY_BOTTOM_INDEX: string = "bottomIndex";
export const QUERY_TOP_INDEX: string = "topIndex";
export const BOTTOM_INDEX: string = "bottomIndex";
export const TOP_INDEX: string = "topIndex";

export const PAGINATION_SIZE: string = "size";

export const PAGINATION_PAGE: string = "page";

export const HAS_BOTTOM_INDEX: string = "hasBottomIndex";
export const HAS_TOP_INDEX: string = "hasTopIndex";
export const HAS_PAGINATION_SIZE: string = "hasSize";
export const HAS_PAGINATION_PAGE: string = "hasPage";

/**
 * 会根据 body 或 query 来计算 page 和 size，并放入 req 内
 * @param req
 * @param res
 * @param next
 */
export async function pagination(req: any, res: Response, next: NextFunction): Promise<void> {
  const bottomIndex = req.body[BODY_BOTTOM_INDEX] || req.query[QUERY_BOTTOM_INDEX];
  const topIndex = req.body[BODY_TOP_INDEX] || req.query[QUERY_TOP_INDEX];
  const size = req.body[PAGINATION_SIZE] || req.query[PAGINATION_SIZE];
  const page = req.body[PAGINATION_PAGE] || req.query[PAGINATION_PAGE];
  const bottomIndexNumber: number = Number(bottomIndex);
  const topIndexNumber: number = Number(topIndex);
  const sizeNumber: number = Number(size);
  const pageNumber: number = Number(page);

  req[HAS_BOTTOM_INDEX] = false;
  req[HAS_TOP_INDEX] = false;
  req[HAS_PAGINATION_SIZE] = false;
  req[HAS_PAGINATION_PAGE] = false;

  if (!isNaN(pageNumber)) {
    req[PAGINATION_PAGE] = pageNumber;
    req[HAS_PAGINATION_PAGE] = true;
  }

  if (!isNaN(bottomIndexNumber)) {
    req[BOTTOM_INDEX] = bottomIndexNumber;
    req[HAS_BOTTOM_INDEX] = true;
  }

  if (!isNaN(topIndexNumber)) {
    req[TOP_INDEX] = topIndexNumber;
    req[HAS_TOP_INDEX] = true;
  }

  if (!isNaN(sizeNumber)) {
    req[PAGINATION_SIZE] = sizeNumber;
    req[HAS_PAGINATION_SIZE] = true;
  }

  if (!isNaN(sizeNumber) && isNaN(topIndexNumber) && isNaN(bottomIndexNumber)) {
    req[TOP_INDEX] = 0;
    req[HAS_TOP_INDEX] = true;
  }

  next();
}
