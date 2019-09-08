import { Migration, DriverOptions, DriverType, MigrationOptions, SqlType, SqlFlag } from "sakura-node-3";
import { Farmrecord } from "../model/farmrecord";

export async function migrateInitTable(): Promise<void> {
  const databaseType: "pg" | "mysql" | string | undefined = process.env["DB"];
  const username: string | undefined = process.env["DB_USER"];
  const password: string | undefined = process.env["DB_PASSWORD"];
  const host: string | undefined = process.env["DB_HOST"];
  const port: number = Number(process.env["DB_PORT"]);
  const databaseName: string | undefined = process.env["DB_NAME"];

  let driverType: DriverType;
  if (databaseType === "pg") {
    driverType = DriverType.POSTGRES;
  } else if (databaseType === "mysql") {
    driverType = DriverType.MYSQL;
  } else {
    throw new Error(`Unknown databaseType ${databaseType}`);
  }

  const driverOptions: DriverOptions = {
    username,
    password,
    host,
    port,
    type: driverType,
    database: databaseName
  };

  const migrationOptions: MigrationOptions = {
    driverOptions,
    version: 2,
    appName: "farmrecord"
  };

  const migration: Migration = new Migration(migrationOptions);

  // ------1------
  // migration.addModel(Farmrecord);
  // ------2------
  migration.addColumn(Farmrecord, {
    name: "record_video_url",
    type: SqlType.TEXT,
    flag: SqlFlag.NULLABLE,
    comment: "记录的视频url"
  });
  migration.addColumn(Farmrecord, {
    name: "record_video_cover_url",
    type: SqlType.TEXT,
    flag: SqlFlag.NULLABLE,
    comment: "记录的视频封面"
  });

  console.log(migration.preview());
  await migration.migrate();
}
