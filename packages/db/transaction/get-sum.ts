import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import { subDays } from "date-fns";
import { and, eq, gt, sum } from "drizzle-orm";

export type GetTransactionsSumResult = number;

export async function getTransactionsSum(db: DB): Promise<GetTransactionsSumResult> {
  const driver = getDBDriver(db) as any;
  const [transactionsTable, transactionStatusesTable] = [
    getDBTable(db, "transactionsTable"),
    getDBTable(db, "transactionStatusesTable"),
  ];

  const result = await driver
    .select({ sum: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .innerJoin(transactionStatusesTable, eq(transactionStatusesTable.id, transactionsTable.statusId))
    .where(and(gt(transactionsTable.createdAt, subDays(new Date(), 30)), eq(transactionStatusesTable.name, "success")));

  return +(result.at(0)?.sum ?? 0);
}
