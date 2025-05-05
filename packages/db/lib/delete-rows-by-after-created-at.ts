import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable, type TableName } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import { gt } from "drizzle-orm";

export async function deleteRowsAfterCreatedAt(db: DB, table: TableName, afterCreatedAt: Date) {
  const driver = getDBDriver(db) as any;
  const targetTable = getDBTable(db, table) as any;
  return driver.delete(targetTable).where(gt(targetTable.createdAt, afterCreatedAt));
}
