import type { DB } from "@repo/db/types";
import * as mysqlTables from "@repo/mysql/schema";
import * as postgresTables from "@repo/postgres/schema";
import * as singlestoreTables from "@repo/singlestore/schema";

export type TableName = keyof typeof singlestoreTables | keyof typeof postgresTables | keyof typeof mysqlTables;

export function getDBTable<T extends DB, U extends TableName>(db: T, name: U) {
  return (
    db === "singlestore" ? singlestoreTables[name] : db === "postgres" ? postgresTables[name] : mysqlTables[name]
  ) as T extends "singlestore"
    ? (typeof singlestoreTables)[U]
    : T extends "postgres"
      ? (typeof postgresTables)[U]
      : (typeof mysqlTables)[U];
}
