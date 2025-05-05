import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable, type TableName } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import { asc } from "drizzle-orm";

export async function getFirstCreatedAt(db: DB, table: TableName): Promise<Date | undefined> {
  const driver = getDBDriver(db) as any;
  const targetTable = getDBTable(db, table) as any;

  return (
    await driver.select({ createdAt: targetTable.createdAt }).from(targetTable).orderBy(asc(targetTable.createdAt)).limit(1)
  ).at(0)?.createdAt;
}
