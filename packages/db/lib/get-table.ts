import type { DB } from "@repo/db/types";
import * as postgresTables from "@repo/postgres/schema";
import * as singlestoreTables from "@repo/singlestore/schema";

type TableName = keyof typeof singlestoreTables | keyof typeof postgresTables;

export function getDBTable<T extends DB, U extends TableName>(db: T, name: U) {
  return (db === "singlestore" ? singlestoreTables[name] : postgresTables[name]) as T extends "singlestore"
    ? (typeof singlestoreTables)[U]
    : (typeof postgresTables)[U];
}
