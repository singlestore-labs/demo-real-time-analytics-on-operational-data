import { faker } from "@faker-js/faker";
import type {
  TransactionRecord,
  TransactionStatusRecord,
  TransactionTypeRecord,
  TransactionValues,
} from "@repo/db/transaction/types";

export const TRANSACTION_TYPES = [
  { id: 1, name: "transfer" },
  { id: 2, name: "withdrawal" },
  { id: 3, name: "deposit" },
] satisfies TransactionTypeRecord[];

export const TRANSACTION_STATUSES = [
  { id: 1, name: "success" },
  { id: 2, name: "failed" },
  { id: 3, name: "pending" },
] satisfies TransactionStatusRecord[];

export function generateTransaction<T extends Partial<TransactionValues>>(values?: T) {
  const now = new Date();

  return {
    id: values?.id,
    accountIdFrom: values?.accountIdFrom,
    accountIdTo: values?.accountIdTo,
    typeId: values?.typeId ?? faker.helpers.arrayElement(TRANSACTION_TYPES).id,
    statusId: values?.statusId ?? faker.helpers.arrayElement(TRANSACTION_STATUSES).id,
    amount: values?.amount ?? faker.finance.amount({ dec: 2 }),
    createdAt: values?.createdAt ?? now,
    updatedAt: values?.updatedAt ?? now,
  } as T["id"] extends number ? TransactionRecord : TransactionValues;
}
