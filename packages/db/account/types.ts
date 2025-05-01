import type * as mysql from "@repo/mysql/account/types";
import type * as postgres from "@repo/postgres/account/types";
import type * as singlestore from "@repo/singlestore/account/types";

export type AccountRecord = postgres.AccountRecord | singlestore.AccountRecord | mysql.AccountRecord;
export type AccountValues = postgres.AccountValues | singlestore.AccountValues | mysql.AccountValues;

export type AccountUpdateValues = Partial<Omit<AccountValues, "id">>;
