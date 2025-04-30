import type * as postgres from "@repo/postgres/transaction/types";
import type * as singlestore from "@repo/singlestore/transaction/types";
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from "@repo/utils/transaction";

export type TransactionRecord = postgres.TransactionRecord | singlestore.TransactionRecord;
export type TransactionValues = postgres.TransactionValues | singlestore.TransactionValues;

export type TransactionTypeRecord = postgres.TransactionTypeRecord | singlestore.TransactionTypeRecord;
export type TransactionTypeValues = postgres.TransactionTypeValues | singlestore.TransactionTypeValues;

export type TransactionStatusRecord = postgres.TransactionStatusRecord | singlestore.TransactionStatusRecord;
export type TransactionStatusValues = postgres.TransactionStatusValues | singlestore.TransactionStatusValues;

export type Transaction = Omit<TransactionRecord, "typeId" | "statusId"> & {
  type: (typeof TRANSACTION_TYPES)[number]["name"];
  status: (typeof TRANSACTION_STATUSES)[number]["name"];
};
