import { fastifyWebsocket } from "@fastify/websocket";
import { createAccount } from "@repo/db/account/create";
import { DB } from "@repo/db/types";
import { createUser } from "@repo/db/user/create";
import { generateTransaction } from "@repo/utils/transaction";
import { generateUser } from "@repo/utils/user";
import { createWSMessage } from "@repo/ws/message/create";
import Fastify from "fastify";

const NEW_RECORDS_INTERVAL = 5000;

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

  const dbs = ["singlestore", "postgres"] satisfies DB[];

  setInterval(async () => {
    try {
      const user = generateUser();
      const now = new Date();
      await Promise.all(
        dbs.map(async (db) => {
          const userRecord = await createUser(db, { ...user, createdAt: now });
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
      const transaction = generateTransaction();
      const now = new Date();
      await Promise.all(dbs.map(async (db) => {}));
    } catch (error) {
      app.log.error(error);
    }
  }, NEW_RECORDS_INTERVAL);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
