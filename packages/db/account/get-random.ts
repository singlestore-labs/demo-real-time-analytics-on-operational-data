import type { AccountRecord } from "@repo/db/account/types";
import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import { sql } from "drizzle-orm";

export async function getRandomAccount(db: DB): Promise<AccountRecord | undefined> {
  const driver = getDBDriver(db) as any;
  const [accountsTable] = [getDBTable(db, "accountsTable")];

  const query = driver
    .select()
    .from(accountsTable)
    .limit(1)
    .orderBy(db === "singlestore" ? sql`RAND()` : sql`RANDOM()`);

  const result = await query;

  return result.at(0);
}
