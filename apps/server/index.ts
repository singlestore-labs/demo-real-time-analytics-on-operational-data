import { fastifyWebsocket } from "@fastify/websocket";
import { createAccount } from "@repo/db/account/create";
import { getRandomAccount } from "@repo/db/account/get-random";
import { updateAccount } from "@repo/db/account/update";
import { createTransaction } from "@repo/db/transaction/create";
import { DB } from "@repo/db/types";
import { createUser } from "@repo/db/user/create";
import { generateTransaction } from "@repo/utils/transaction";
import { generateUser } from "@repo/utils/user";
import { createWSMessage } from "@repo/ws/message/create";
import Fastify from "fastify";

const NEW_RECORDS_INTERVAL = 3000;

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

try {
  await app.listen({ port: 4000 });

  const dbs = ["singlestore", "mysql", "postgres"] satisfies DB[];

  setInterval(async () => {
    try {
      const now = new Date();
      const user = generateUser({ createdAt: now });
      await Promise.all(
        dbs.map(async (db) => {
          const userRecord = await createUser(db, user);
          broadcast(createWSMessage({ db, type: "insert.user", payload: userRecord }));
          const accountRecord = await createAccount(db, { userId: userRecord.id, createdAt: now });
          broadcast(createWSMessage({ db, type: "insert.account", payload: accountRecord }));
        }),
      );
    } catch (error) {
      app.log.error(error);
    }
  }, NEW_RECORDS_INTERVAL);

  setInterval(async () => {
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
          const transactionRecord = await createTransaction(db, transaction);
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
  }, NEW_RECORDS_INTERVAL);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
