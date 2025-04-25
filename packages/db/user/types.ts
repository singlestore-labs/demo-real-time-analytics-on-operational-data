import type * as postgres from "@repo/postgres/user/types";
import type * as singlestore from "@repo/singlestore/user/types";

export type UserRecord = postgres.UserRecord | singlestore.UserRecord;
export type UserValues = postgres.UserValues | singlestore.UserValues;
