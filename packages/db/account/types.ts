import type * as postgres from "@repo/postgres/account/types";
import type * as singlestore from "@repo/singlestore/account/types";

export type AccountRecord = postgres.AccountRecord | singlestore.AccountRecord;
export type AccountValues = postgres.AccountValues | singlestore.AccountValues;
