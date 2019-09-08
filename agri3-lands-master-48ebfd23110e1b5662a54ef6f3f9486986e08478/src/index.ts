require("./service/database"); // tslint:disable-line
import express from "express";
import { migrateInitTable } from "./migration/migrateInitTable";

// setup app
const app: express.Application = express();

const v1: express.Router = require("./routes/v1");// tslint:disable-line
app.use("/api", v1);

migrateInitTable().then(() => {
  console.log("finish to migrate");
}).catch((err) => {
  console.error("migrate error", err);
});

app.listen(3000);
console.log(`Server start and listen on port 3000`);
// Logger.debugLog(`Server start and listen on port 3000`);
