import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import type { UserRecord, UserValues } from "@repo/db/user/types";

export async function createUser(db: DB, values: UserValues): Promise<UserRecord> {
  const driver = getDBDriver(db) as any;
  const [usersTable] = [getDBTable(db, "usersTable")];
  const createdAt = values.createdAt || new Date();

  const _values = {
    name: null,
    email: null,
    createdAt,
    updatedAt: createdAt,
    ...values,
  } satisfies Omit<UserRecord, "id">;

  const query = driver.insert(usersTable).values(_values);

  if (db === "singlestore") {
    const result = await query.$returningId();
    return { ..._values, id: result[0]!.id };
  }

  const result = await query.returning();
  return result[0]!;
}
