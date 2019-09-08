import { Migration, DriverOptions, DriverType, MigrationOptions } from "sakura-node-3";
import { Land } from "../model/land";
import { Boundary } from "../model/boundary";

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
    host,
    port,
    username,
    password,
    type: driverType,
    database: databaseName
  };

  const migrationOptions: MigrationOptions = {
    driverOptions,
    version: 1,
    appName: "land"
  };

  const migration: Migration = new Migration(migrationOptions);

  migration.addModel(Land);
  migration.addModel(Boundary);

  console.log(migration.preview());
  await migration.migrate();
}
