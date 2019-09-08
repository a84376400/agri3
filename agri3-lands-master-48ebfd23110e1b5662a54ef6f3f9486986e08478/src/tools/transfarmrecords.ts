import { DBClient, SelectQuery, UpdateQuery, QueryResult, DriverType } from "sakura-node-3";

import {WGS84ToGoogle, GoogleToWGS84} from "gago-coord-transform";

const selectQuery = `SELECT id, record_latitude, record_longitude FROM farmrecords;`;

let dbConnection: DBClient;

dbConnection = DBClient.createClient({
  type: DriverType.POSTGRES,
  username: process.env.DB_USER || "docker",// tslint:disable-line
  password: process.env.DB_PASSWORD || "docker",// tslint:disable-line
  database: "farmrecords",// tslint:disable-line
  host: process.env.DB_HOST || "postgres",// tslint:disable-line
  port: Number(process.env.DB_PORT) || 5432,// tslint:disable-line
  max: Number(process.env.DB_MAX_CONNECTION) || 10// tslint:disable-line
});


dbConnection.query(selectQuery)
  .then((data: QueryResult) => {
    const queries: string[] = data.rows.map((ele: any) => {
  
      const [lon, lat] = WGS84ToGoogle(Number(ele["record_longitude"]), Number(ele["record_latitude"]));
  
      const geojson = `{"type":"Point","coordinates":[${lon},${lat}]}`;
      const query = `UPDATE farmrecords SET record_longitude=${lon}, record_latitude=${lat}, geometry=ST_SetSRID(ST_GeomFromGeojson('${geojson}'), 4326) WHERE id=${ele["id"]};`;
      return query;
    });
    return dbConnection.queryRawInTransaction(queries);
  })
  .then(() => console.log("success"))
  .catch((err) => console.log(err));

