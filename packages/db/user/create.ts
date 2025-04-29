import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import type { UserRecord, UserValues } from "@repo/db/user/types";

export async function createUser(db: DB, value: UserValues): Promise<UserRecord> {
  const driver = getDBDriver(db) as any;
  const [usersTable] = [getDBTable(db, "usersTable")];
  const createdAt = value.createdAt || new Date();

  const _value = {
    name: null,
    email: null,
    createdAt,
    updatedAt: createdAt,
    ...value,
  } satisfies Omit<UserRecord, "id">;

  const query = driver.insert(usersTable).values(_value);

  if (db === "singlestore") {
    const result = await query.$returningId();
    return { id: result[0]!.id, ..._value };
  }

  const result = await query.returning();
  return result[0]!;
}
