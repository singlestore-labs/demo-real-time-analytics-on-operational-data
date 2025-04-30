import { getDBDriver } from "@repo/db/lib/get-driver";
import { getDBTable } from "@repo/db/lib/get-table";
import type { Transaction, TransactionRecord, TransactionValues } from "@repo/db/transaction/types";
import type { DB } from "@repo/db/types";
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from "@repo/utils/transaction";

export async function createTransaction(db: DB, values: TransactionValues): Promise<Transaction> {
  const driver = getDBDriver(db) as any;
  const [transactionsTable] = [getDBTable(db, "transactionsTable")];
  const createdAt = values.createdAt || new Date();

  const _values = {
    accountIdFrom: null,
    accountIdTo: null,
    amount: null,
    createdAt,
    updatedAt: createdAt,
    ...values,
  } satisfies Omit<TransactionRecord, "id">;

  const query = driver.insert(transactionsTable).values(_values);
  const type = TRANSACTION_TYPES.find(({ id }) => id === _values.typeId)!.name;
  const status = TRANSACTION_STATUSES.find(({ id }) => id === _values.statusId)!.name;

  if (db === "singlestore") {
    const result = await query.$returningId();
    return { ..._values, id: result[0]!.id, type, status };
  }

  const result = await query.returning();
  return { ...result[0]!, type, status };
}
