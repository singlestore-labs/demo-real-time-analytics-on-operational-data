import type { DB } from "@repo/db/types";
import { mysql } from "@repo/mysql";
import { postgres } from "@repo/postgres";
import { singlestore } from "@repo/singlestore";

export function getDBDriver<T extends DB>(db: T) {
  return (db === "singlestore" ? singlestore : db === "postgres" ? postgres : mysql) as T extends "singlestore"
    ? typeof singlestore
    : T extends "postgres"
      ? typeof postgres
      : typeof mysql;
}
