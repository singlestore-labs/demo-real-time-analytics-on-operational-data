import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import { count } from "drizzle-orm";

export async function getDBInfo(db: DB) {
  const driver = getDBDriver(db);
  const tables = [getDBTable(db, "usersTable"), getDBTable(db, "accountsTable"), getDBTable(db, "transactionsTable")];

  const [users, accounts, transactions] = (await Promise.all(
    tables.map(async (table) => {
      const result = await (driver as any).select({ count: count(table.id) }).from(table);
      return result[0]?.count || 0;
    }),
  )) as [number, number, number];

  return { users, accounts, transactions };
}
