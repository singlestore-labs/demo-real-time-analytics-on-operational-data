import type { DB } from "@repo/db/types";
import { postgres } from "@repo/postgres";
import { singlestore } from "@repo/singlestore";

export function getDBDriver<T extends DB>(db: T) {
  return (db === "singlestore" ? singlestore : postgres) as T extends "singlestore" ? typeof singlestore : typeof postgres;
}
