import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { DB } from "@repo/db/types";
import type { AccountRecord } from "@repo/postgres/account/types";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";

export type GetTopRecipientResult =
  | {
      accountId: AccountRecord["id"] | null;
      count: number;
    }
  | undefined;

export async function getTopRecipient(db: DB): Promise<GetTopRecipientResult> {
  const driver = getDBDriver(db) as any;

  const [transactionsTable, transactionTypesTable, transactionStatusesTable] = [
    getDBTable(db, "transactionsTable"),
    getDBTable(db, "transactionTypesTable"),
    getDBTable(db, "transactionStatusesTable"),
  ];

  const result = await driver
    .select({
      accountId: transactionsTable.accountIdTo,
      count: count(transactionsTable.id).as("count"),
    })
    .from(transactionsTable)
    .innerJoin(transactionTypesTable, eq(transactionTypesTable.id, transactionsTable.typeId))
    .innerJoin(transactionStatusesTable, eq(transactionStatusesTable.id, transactionsTable.statusId))
    .where(and(eq(transactionTypesTable.name, "transfer"), eq(transactionStatusesTable.name, "success")))
    .groupBy(transactionsTable.accountIdTo)
    .orderBy(desc(db === "postgres" ? sql`"count"` : sql`count`), asc(transactionsTable.accountIdTo))
    .limit(1);

  return result.at(0);
}
