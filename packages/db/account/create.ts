import type { AccountRecord, AccountValues } from "@repo/db/account/types";
import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";

export async function createAccount(db: DB, values: AccountValues): Promise<AccountRecord> {
  const driver = getDBDriver(db) as any;
  const [accountsTable] = [getDBTable(db, "accountsTable")];
  const createdAt = values.createdAt || new Date();

  const _values = {
    balance: "0",
    createdAt,
    updatedAt: createdAt,
    ...values,
  } satisfies Omit<AccountRecord, "id">;

  const query = driver.insert(accountsTable).values(_values);

  if (db === "postgres") {
    const result = await query.returning();
    return result[0]!;
  }

  const result = await query.$returningId();
  return { ..._values, id: result[0]!.id };
}
