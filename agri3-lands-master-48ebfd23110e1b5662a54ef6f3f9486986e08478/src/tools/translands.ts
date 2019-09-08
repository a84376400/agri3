import { DBClient, SelectQuery, UpdateQuery, QueryResult } from "sakura-node-3";
import { Land } from "../model/land";

require("../service/database"); // tslint:disable-line
import {WGS84ToGoogle, GoogleToWGS84} from "gago-coord-transform";

const selectQuery = new SelectQuery().fromClass(Land)
  .select(["id", "geojson"]);


DBClient.getClient().query(selectQuery)
  .then((data: QueryResult) => {
    const queries: string[] = data.rows.map((ele: any) => {
      if (ele["geojson"]["type"] !== "Polygon") {
        throw `the geojson is ${ele["geojson"]["type"]}. the tool accept polygon only`;
      }
  
      for (let firstLayer in ele["geojson"]["coordinates"]) {
        for (let secondLayer in ele["geojson"]["coordinates"][firstLayer]) {
          const [lon, lat] = ele["geojson"]["coordinates"][firstLayer][secondLayer];
          ele["geojson"]["coordinates"][firstLayer][secondLayer] = WGS84ToGoogle(lon, lat);
        }
      }
  
      const geojson = JSON.stringify(ele["geojson"]);
      const query = `UPDATE lands SET geojson='${geojson}', geometry=ST_SetSRID(ST_GeomFromGeojson('${geojson}'), 4326), land_center=ST_ASGeojson(ST_CENTROID(ST_SetSRID(ST_GeomFromGeojson('${geojson}'), 4326)))::json WHERE id=${ele["id"]};`;
      return query;
    });
    return DBClient.getClient().queryRawInTransaction(queries);
  })
  .then(() => console.log("success"))
  .catch((err) => console.log(err));

