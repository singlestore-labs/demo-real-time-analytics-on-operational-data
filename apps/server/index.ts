import { fastifyWebsocket } from "@fastify/websocket";
import { createAccount } from "@repo/db/account/create";
import { getRandomAccount } from "@repo/db/account/get-random";
import { updateAccount } from "@repo/db/account/update";
import { countRows } from "@repo/db/lib/count-rows";
import { deleteRowsAfterCreatedAt } from "@repo/db/lib/delete-rows-by-after-created-at";
import { getFirstCreatedAt } from "@repo/db/lib/get-first-created-at";
import { TableName } from "@repo/db/lib/get-table";
import { createTransaction } from "@repo/db/transaction/create";
import { DB } from "@repo/db/types";
import { createUser } from "@repo/db/user/create";
import { generateTransaction } from "@repo/utils/transaction";
import { generateUser } from "@repo/utils/user";
import { createWSMessage } from "@repo/ws/message/create";
import Fastify from "fastify";

type TargetTableName = Extract<TableName, "usersTable" | "accountsTable" | "transactionsTable">;

const SIMULATION_INTERVAL = 3000;

const ROWS_TARGET = {
  usersTable: 1_000_000,
  accountsTable: 10_000_000,
  transactionsTable: 10_000_000,
} satisfies Record<TargetTableName, number>;

const ROWS_LIMIT = {
  usersTable: ROWS_TARGET.usersTable + 1_000_000,
  accountsTable: ROWS_TARGET.accountsTable + 1_000_000,
  transactionsTable: ROWS_TARGET.transactionsTable + 1_000_000,
} satisfies Record<TargetTableName, number>;

const ROWS_COUNT = {
  singlestore: {
    usersTable: 0,
    accountsTable: 0,
    transactionsTable: 0,
  },
  mysql: {
    usersTable: 0,
    accountsTable: 0,
    transactionsTable: 0,
  },
  postgres: {
    usersTable: 0,
    accountsTable: 0,
    transactionsTable: 0,
  },
} satisfies Record<DB, Record<TargetTableName, number>>;

const IS_RESETTING: Record<TargetTableName, boolean> = {
  usersTable: false,
  accountsTable: false,
  transactionsTable: false,
};

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

async function resetTable(db: DB, table: TargetTableName) {
  IS_RESETTING[table] = true;
  const createdAt = await getFirstCreatedAt(db, table);
  await deleteRowsAfterCreatedAt(db, table, createdAt || new Date());
  ROWS_COUNT[db][table] = ROWS_TARGET[table];
  IS_RESETTING[table] = false;
}

try {
  await app.listen({ port: 4000 });

  const dbs = ["singlestore", "mysql", "postgres"] satisfies DB[];

  await Promise.all(
    dbs.map((db) => {
      return Promise.all(
        (["usersTable", "accountsTable", "transactionsTable"] satisfies TargetTableName[]).map(async (tableName) => {
          ROWS_COUNT[db][tableName] = await countRows(db, tableName);
        }),
      );
    }),
  );

  setInterval(async () => {
    if (IS_RESETTING.usersTable || IS_RESETTING.accountsTable) return;

    try {
      const now = new Date();
      const user = generateUser({ createdAt: now });
      await Promise.all(
        dbs.map(async (db) => {
          if (ROWS_COUNT[db].usersTable === ROWS_LIMIT.usersTable) {
            await resetTable(db, "usersTable");
          }

          const userRecord = await createUser(db, user);
          ROWS_COUNT[db].usersTable++;
          broadcast(createWSMessage({ db, type: "insert.user", payload: userRecord }));

          if (ROWS_COUNT[db].accountsTable === ROWS_LIMIT.accountsTable) {
            await resetTable(db, "accountsTable");
          }

          const accountRecord = await createAccount(db, { userId: userRecord.id, createdAt: now });
          ROWS_COUNT[db].accountsTable++;
          broadcast(createWSMessage({ db, type: "insert.account", payload: accountRecord }));
        }),
      );
    } catch (error) {
      app.log.error(error);
    }
  }, SIMULATION_INTERVAL);

  setInterval(async () => {
    if (IS_RESETTING.transactionsTable) return;

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
        dbs.map(async (db) => {
          if (ROWS_COUNT[db].transactionsTable === ROWS_LIMIT.transactionsTable) {
            await resetTable(db, "transactionsTable");
          }

          const transactionRecord = await createTransaction(db, transaction);
          ROWS_COUNT[db].transactionsTable++;
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
