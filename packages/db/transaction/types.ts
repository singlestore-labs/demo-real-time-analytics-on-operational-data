import type * as mysql from "@repo/mysql/transaction/types";
import type * as postgres from "@repo/postgres/transaction/types";
import type * as singlestore from "@repo/singlestore/transaction/types";
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from "@repo/utils/transaction";

export type TransactionRecord = postgres.TransactionRecord | singlestore.TransactionRecord | mysql.TransactionRecord;
export type TransactionValues = postgres.TransactionValues | singlestore.TransactionValues | mysql.TransactionValues;

export type TransactionTypeRecord =
  | postgres.TransactionTypeRecord
  | singlestore.TransactionTypeRecord
  | mysql.TransactionTypeRecord;

export type TransactionTypeValues =
  | postgres.TransactionTypeValues
  | singlestore.TransactionTypeValues
  | mysql.TransactionTypeValues;

export type TransactionStatusRecord =
  | postgres.TransactionStatusRecord
  | singlestore.TransactionStatusRecord
  | mysql.TransactionStatusRecord;

export type TransactionStatusValues =
  | postgres.TransactionStatusValues
  | singlestore.TransactionStatusValues
  | mysql.TransactionStatusValues;

export type Transaction = Omit<TransactionRecord, "typeId" | "statusId"> & {
  type: (typeof TRANSACTION_TYPES)[number]["name"];
  status: (typeof TRANSACTION_STATUSES)[number]["name"];
};
