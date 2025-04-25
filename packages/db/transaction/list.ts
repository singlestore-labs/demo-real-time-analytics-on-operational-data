import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { Transaction } from "@repo/db/transaction/types";
import type { DB, WithPagination } from "@repo/db/types";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";

export type ListTransactionsOptions = {
  limit?: number;
  offset?: number;
};

export type ListTransactionsResult = WithPagination<Transaction[]>;

export async function listTransactions(db: DB, options: ListTransactionsOptions = {}): Promise<ListTransactionsResult> {
  const { limit = 10, offset = 0 } = options;
  const driver = getDBDriver(db) as any;
  const [transactionsTable, transactionTypesTable, transactionStatusesTable] = [
    getDBTable(db, "transactionsTable"),
    getDBTable(db, "transactionTypesTable"),
    getDBTable(db, "transactionStatusesTable"),
  ];

  const [{ count }] = await driver.select({ count: sql<number>`count(${transactionsTable.id})` }).from(transactionsTable);

  const query = await driver
    .select({
      ...getTableColumns(transactionsTable),
      type: transactionTypesTable.name,
      status: transactionStatusesTable.name,
    })
    .from(transactionsTable)
    .innerJoin(transactionTypesTable, eq(transactionTypesTable.id, transactionsTable.typeId))
    .innerJoin(transactionStatusesTable, eq(transactionStatusesTable.id, transactionsTable.statusId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(transactionsTable.createdAt), desc(transactionsTable.id));

  const result = await query;

  return [result, { limit, offset, count }];
}
