import { Migration, DriverOptions, DriverType, MigrationOptions } from "sakura-node-3";
import { User } from "../model/user";
import { Department } from "../model/department";

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
    appName: "auth"
  };

  const migration: Migration = new Migration(migrationOptions);

  migration.addModel(User);
  migration.addModel(Department);

  console.log(migration.preview());
  await migration.migrate();
}
