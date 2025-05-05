import { fastifyWebsocket } from "@fastify/websocket";
import { createAccount } from "@repo/db/account/create";
import { getRandomAccount } from "@repo/db/account/get-random";
import { updateAccount } from "@repo/db/account/update";
import { countRows } from "@repo/db/lib/count-rows";
import { deleteRowsAfterCreatedAt } from "@repo/db/lib/delete-rows-by-after-created-at";
import { getFirstCreatedAt } from "@repo/db/lib/get-first-created-at";
import type { TableName } from "@repo/db/lib/get-table";
import { createTransaction } from "@repo/db/transaction/create";
import type { DB } from "@repo/db/types";
import { createUser } from "@repo/db/user/create";
import { generateTransaction } from "@repo/utils/transaction";
import { generateUser } from "@repo/utils/user";
import { createWSMessage } from "@repo/ws/message/create";
import Fastify from "fastify";

type TargetTableName = Extract<TableName, "usersTable" | "accountsTable" | "transactionsTable">;

const DBs = ["singlestore", "mysql", "postgres"] satisfies DB[];

const SIMULATION_INTERVAL = 3000;

const TRANSACTION_ROWS_TARGET = 10_000_000;
const TRANSACTIONS_ROW_LIMIT = TRANSACTION_ROWS_TARGET + 5;
let TRANSACTION_ROW_COUNT = 0;

let IS_RESETTING = false;

const app = Fastify({ logger: true });

const wsClients = new Set<WebSocket>();

app.register(fastifyWebsocket);

app.register(async function (app) {
  app.get("/", { websocket: true }, (ws) => {
    wsClients.add(ws);
    ws.on("close", () => wsClients.delete(ws));
  });
});

function broadcast(event: unknown) {
  const data = JSON.stringify(event);
  for (const client of wsClients) {
    client.send(data);
  }
}

async function resetTables() {
  IS_RESETTING = true;
  const createdAt = (await getFirstCreatedAt("singlestore", "usersTable")) || new Date();

  await Promise.all(
    DBs.map((db) => {
      return Promise.all(
        (["usersTable", "accountsTable", "transactionsTable"] satisfies TargetTableName[]).map((tableName) => {
          return deleteRowsAfterCreatedAt(db, tableName, createdAt);
        }),
      );
    }),
  );

  TRANSACTION_ROW_COUNT = await countRows("singlestore", "transactionsTable");
  IS_RESETTING = false;
}

try {
  await app.listen({ port: 4000, host: "0.0.0.0" });

  TRANSACTION_ROW_COUNT = await countRows("singlestore", "transactionsTable");

  setInterval(async () => {
    if (IS_RESETTING) return;

    try {
      const now = new Date();
      const user = generateUser({ createdAt: now });
      await Promise.all(
        DBs.map(async (db) => {
          const userRecord = await createUser(db, user);
          broadcast(createWSMessage({ db, type: "insert.user", payload: userRecord }));
          const accountRecord = await createAccount(db, { userId: userRecord.id, createdAt: now });
          broadcast(createWSMessage({ db, type: "insert.account", payload: accountRecord }));
        }),
      );
    } catch (error) {
      app.log.error(error);
    }
  }, SIMULATION_INTERVAL);

  setInterval(async () => {
    if (IS_RESETTING) return;

    try {
      let [accountFrom, accountTo] = await Promise.all([getRandomAccount("singlestore"), getRandomAccount("singlestore")]);

      while (accountTo?.id === accountFrom?.id) {
        accountTo = await getRandomAccount("singlestore");
      }

      const now = new Date();
      const transaction = generateTransaction({ accountIdFrom: accountFrom?.id, accountIdTo: accountTo?.id, createdAt: now });
      const newAccountFromBalance = (+(accountFrom!.balance ?? 0) - +(transaction.amount ?? 0)).toFixed(2);
      const newAccountToBalance = (+(accountTo!.balance ?? 0) + +(transaction.amount ?? 0)).toFixed(2);

      await Promise.all(
        DBs.map(async (db) => {
          if (db === "singlestore" && TRANSACTION_ROW_COUNT === TRANSACTIONS_ROW_LIMIT) {
            await resetTables();
          }

          const transactionRecord = await createTransaction(db, transaction);
          TRANSACTION_ROW_COUNT++;
          broadcast(createWSMessage({ db, type: "insert.transaction", payload: transactionRecord }));

          await Promise.all(
            [
              async () => {
                await updateAccount(db, accountFrom!.id, { balance: newAccountFromBalance });
                const message = createWSMessage({
                  db,
                  type: "update.account",
                  payload: { ...accountFrom!, balance: newAccountFromBalance },
                });
                broadcast(message);
              },
              async () => {
                await updateAccount(db, accountTo!.id, { balance: newAccountToBalance.toString() });
                const message = createWSMessage({
                  db,
                  type: "update.account",
                  payload: { ...accountTo!, balance: newAccountToBalance },
                });
                broadcast(message);
              },
            ].map((fn) => fn()),
          );
        }),
      );
    } catch (error) {
      app.log.error(error);
    }
  }, SIMULATION_INTERVAL);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
