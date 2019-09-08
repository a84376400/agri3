import { DBClient, UpdateQuery, QueryResult, DriverType } from "sakura-node-3";
import * as fs from "fs";

require("../service/database"); // tslint:disable-line
import {WGS84ToGoogle, GoogleToWGS84} from "gago-coord-transform";

const selectTrackQuery = `SELECT id, track_data FROM track;`
const selectGPSQuery = `SELECT id, longitude, latitude FROM gps;`


  let dbConnection: DBClient;

  dbConnection = DBClient.createClient({
    type: DriverType.POSTGRES,
    username: process.env.DB_USER || "postgres",// tslint:disable-line
    password: process.env.DB_PASSWORD || "postgres",// tslint:disable-line
    database: "track",// tslint:disable-line
    host: process.env.DB_HOST || "localhost",// tslint:disable-line
    port: Number(process.env.DB_PORT) || 5435,// tslint:disable-line
    max: Number(process.env.DB_MAX_CONNECTION) || 10// tslint:disable-line
  });

  const tracks: any = require("../../data/track.json");
  const sqls = tracks.RECORDS.map((track: any) => {
    const startTime = `(TIMESTAMP '1970-01-01' + interval '${track["start_time"]} seconds') :: timestamp without time zone`;
    const endTime = `(TIMESTAMP '1970-01-01' + interval '${track["end_time"]} seconds') :: timestamp without time zone`;
    const createdAt = `(TIMESTAMP '1970-01-01' + interval '${track["created_at"]} seconds') :: timestamp without time zone`;
    const duration = Math.floor(Number(track["end_time"]) - Number(track["start_time"]));

    
    const query = `INSERT INTO "public"."track"("app_id", "device_id", "series_number", "data_into_track", "track_data", "start_time", "end_time", "distance", "duration", "created_at") VALUES ('3in1', 7, 'MOBIL_1_1', '{"departmentID":1,"departmentName":"图木舒克","uid":3,"nickName":"图木舒克","account":"18130857611"}', '{"geojson":${track.geojson},"data":null}',${startTime}, ${endTime}, ${track.distance}, ${duration}, ${createdAt});`
    return query;
  })

  // console.log(sqls);
  
  dbConnection.queryRawInTransaction(sqls)
  .then(() => dbConnection.query("UPDATE track SET distance = st_length( ST_Transform( st_setsrid(st_geomfromgeojson(track_data->>'geojson'), 4326), 32611))"))
  .then(() => console.log("success"))
  .catch((err) => console.log(err));

