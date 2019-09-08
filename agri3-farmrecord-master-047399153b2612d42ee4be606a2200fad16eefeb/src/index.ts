require("./service/database"); // tslint:disable-line
import express from "express";
import { Aliyun, AliyunConfigOptions } from "gago-cloud-service";
import { migrateInitTable } from "./migration/migrateInitTable";

migrateInitTable().then(() => {
  console.log("finish to migrate");
}).catch((err) => {
  console.error("migrate error", err);
});

const aluyunConfig: AliyunConfigOptions = {
  enterpriseId: "1917856451201954",
  accessId: "LTAIbuVHTjdhr0Nz",
  accessSecret: "6obMhpcupEB8J287J2QG7EiCJTe4lj",
  ossRegion: "oss-cn-beijing"
};
Aliyun.setConfig(aluyunConfig);

// setup app
const app: express.Application = express();

const v1: express.Router = require("./routes/v1"); // tslint:disable-line
app.use("/api", v1);
// app.use("/", v4);

app.listen(3000);
console.log(`Server start and listen on port 3000`);
// Logger.debugLog(`Server start and listen on port 3000`);
