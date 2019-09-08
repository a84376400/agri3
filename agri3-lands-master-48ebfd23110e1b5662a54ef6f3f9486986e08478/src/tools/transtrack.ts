import { DBClient, UpdateQuery, QueryResult, DriverType } from "sakura-node-3";

require("../service/database"); // tslint:disable-line
import {WGS84ToGoogle, GoogleToWGS84} from "gago-coord-transform";

const selectTrackQuery = `SELECT id, track_data FROM track;`
const selectGPSQuery = `SELECT id, longitude, latitude FROM gps;`


  let dbConnection: DBClient;

  dbConnection = DBClient.createClient({
    type: DriverType.POSTGRES,
    username: process.env.DB_USER || "docker",// tslint:disable-line
    password: process.env.DB_PASSWORD || "docker",// tslint:disable-line
    database: "track",// tslint:disable-line
    host: process.env.DB_HOST || "postgres",// tslint:disable-line
    port: Number(process.env.DB_PORT) || 5432,// tslint:disable-line
    max: Number(process.env.DB_MAX_CONNECTION) || 10// tslint:disable-line
  });
  
  
  dbConnection.query(selectTrackQuery)
  .then((data: QueryResult) => {
    const queries: string[] = data.rows.map((ele: any) => {
      if (ele["track_data"]["geojson"]["type"] !== "MultiLineString") {
        throw `the geojson is ${ele["track_data"]["geojson"]["type"]}. the tool accept MultiLineString only`;
      }
  
      for (let firstLayer in ele["track_data"]["geojson"]["coordinates"]) {
        for (let secondLayer in ele["track_data"]["geojson"]["coordinates"][firstLayer]) {
          const [lon, lat] = ele["track_data"]["geojson"]["coordinates"][firstLayer][secondLayer];
          ele["track_data"]["geojson"]["coordinates"][firstLayer][secondLayer] = WGS84ToGoogle(lon, lat);
        }
      }
  
      const geojson = JSON.stringify(ele["track_data"]);
      const query = `UPDATE track SET track_data='${geojson}' WHERE id=${ele["id"]};`;
      return query;
    });
    return DBClient.getClient().queryRawInTransaction(queries);
  })
  .then(() => {
    return dbConnection.query(selectGPSQuery);
  })
  .then((data: any) => {
    const queries: string[] = data.rows.map((ele: any) => {
      let lon = Number(ele["longitude"]);
      let lat = Number(ele["latitude"]);
      [lon, lat] = WGS84ToGoogle(lon, lat);

      const query = `UPDATE gps SET longitude=${lon}, latitude=${lat} WHERE id=${ele["id"]};`;
      return query;
    });
    return DBClient.getClient().queryRawInTransaction(queries);
  })
  .then(() => console.log("success"))
  .catch((err) => console.log(err));

