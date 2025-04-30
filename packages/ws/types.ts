import type { AccountRecord } from "@repo/db/account/types";
import type { Transaction } from "@repo/db/transaction/types";
import type { DB } from "@repo/db/types";
import type { UserRecord } from "@repo/db/user/types";

type WSMessageBase<T extends string, U> = {
  db: DB;
  type: T;
  payload: U;
};

export type WSMessage =
  | WSMessageBase<"insert.user", UserRecord>
  | WSMessageBase<"insert.account", AccountRecord>
  | WSMessageBase<"insert.transaction", Transaction>;
