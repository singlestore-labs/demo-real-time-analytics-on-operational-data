import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB, WithPagination } from "@repo/db/types";
import type { UserRecord } from "@repo/db/user/types";
import { desc, getTableColumns, sql } from "drizzle-orm";

export type ListUsersOptions = {
  limit?: number;
  offset?: number;
};

export type ListUsersResult = WithPagination<UserRecord[]>;

export async function listUsers(db: DB, options: ListUsersOptions = {}): Promise<ListUsersResult> {
  const { limit = 10, offset = 0 } = options;
  const driver = getDBDriver(db) as any;
  const [usersTable] = [getDBTable(db, "usersTable")];

  const query = driver
    .select({
      ...getTableColumns(usersTable),
      count: sql<number>`count(${usersTable.id}) OVER ()`.as("count"),
    })
    .from(usersTable)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(usersTable.createdAt), desc(usersTable.id));

  const result = await query;

  return [result, { limit, offset, count: result[0]?.count || 0 }];
}
