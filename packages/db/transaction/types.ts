import type * as postgres from "@repo/postgres/transaction/types";
import type * as singlestore from "@repo/singlestore/transaction/types";

export type TransactionRecord = postgres.TransactionRecord | singlestore.TransactionRecord;
export type TransactionValues = postgres.TransactionValues | singlestore.TransactionValues;

export type TransactionTypeRecord = postgres.TransactionTypeRecord | singlestore.TransactionTypeRecord;
export type TransactionTypeValues = postgres.TransactionTypeValues | singlestore.TransactionTypeValues;

export type TransactionStatusRecord = postgres.TransactionStatusRecord | singlestore.TransactionStatusRecord;
export type TransactionStatusValues = postgres.TransactionStatusValues | singlestore.TransactionStatusValues;

export type Transaction = Omit<TransactionRecord, "typeId" | "statusId"> & {
  type: TransactionTypeRecord["name"];
  status: TransactionStatusRecord["name"];
};
