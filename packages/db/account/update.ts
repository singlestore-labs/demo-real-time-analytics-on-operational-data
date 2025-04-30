import type { AccountRecord, AccountUpdateValues } from "@repo/db/account/types";
import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import { eq } from "drizzle-orm";

export async function updateAccount(db: DB, id: AccountRecord["id"], values: AccountUpdateValues) {
  const driver = getDBDriver(db) as any;
  const [accountsTable] = [getDBTable(db, "accountsTable")];
  await driver.update(accountsTable).set(values).where(eq(accountsTable.id, id));
}
