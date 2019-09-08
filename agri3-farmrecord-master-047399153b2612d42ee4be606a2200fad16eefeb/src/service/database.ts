// Copyright 2018 齐建兵 (qijianbing2000@163.com). All rights reserved.
// Use of this source code is governed a license that can be found in the LICENSE file.

import { DBClient, DriverType } from "sakura-node-3";

let dbConnection: DBClient;

dbConnection = DBClient.createClient({
  type: DriverType.POSTGRES,
  username: process.env.DB_USER || "docker",// tslint:disable-line
  password: process.env.DB_PASSWORD || "docker",// tslint:disable-line
  database: process.env.DB_NAME || "gago",// tslint:disable-line
  host: process.env.DB_HOST || "postgres",// tslint:disable-line
  port: Number(process.env.DB_PORT) || 5432,// tslint:disable-line
  max: Number(process.env.DB_MAX_CONNECTION) || 10// tslint:disable-line
});

export default dbConnection;
