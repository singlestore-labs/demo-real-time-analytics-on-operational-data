import type { AccountRecord } from "@repo/db/account/types";
import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB, WithPagination } from "@repo/db/types";
import { desc, getTableColumns, sql } from "drizzle-orm";

export type ListAccountsOptions = {
  limit?: number;
  offset?: number;
};

export type ListAccountsResult = WithPagination<AccountRecord[]>;

export async function listAccounts(db: DB, options: ListAccountsOptions = {}): Promise<ListAccountsResult> {
  const { limit = 10, offset = 0 } = options;
  const driver = getDBDriver(db) as any;
  const [accountsTable] = [getDBTable(db, "accountsTable")];

  const query = driver
    .select({
      ...getTableColumns(accountsTable),
      count: sql<number>`count(${accountsTable.id}) OVER ()`.as("count"),
    })
    .from(accountsTable)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(accountsTable.createdAt), desc(accountsTable.id));

  const result = await query;

  return [result, { limit, offset, count: result[0]?.count || 0 }];
}
