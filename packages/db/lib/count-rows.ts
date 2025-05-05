import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable, type TableName } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import { count } from "drizzle-orm";

export async function countRows(db: DB, table: TableName): Promise<number> {
  const driver = getDBDriver(db) as any;
  const targetTable = getDBTable(db, table);
  return (await driver.select({ count: count(targetTable.id) }).from(targetTable)).at(0)?.count || 0;
}
