import type { AccountRecord, AccountValues } from "@repo/db/account/types";
import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";

export async function createAccount(db: DB, value: AccountValues): Promise<AccountRecord> {
  const driver = getDBDriver(db) as any;
  const [accountsTable] = [getDBTable(db, "accountsTable")];
  const createdAt = value.createdAt || new Date();

  const _value = {
    balance: "0",
    createdAt,
    updatedAt: createdAt,
    ...value,
  } satisfies Omit<AccountRecord, "id">;

  const query = driver.insert(accountsTable).values(_value);

  if (db === "singlestore") {
    const result = await query.$returningId();
    return { ..._value, id: result[0]!.id };
  }

  const result = await query.returning();
  return result[0]!;
}
