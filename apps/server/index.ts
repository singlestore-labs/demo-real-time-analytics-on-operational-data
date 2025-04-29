import { fastifyWebsocket } from "@fastify/websocket";
import { DB } from "@repo/db/types";
import { createUser } from "@repo/db/user/create";
import { generateUser } from "@repo/utils/user";
import { createWSMessage } from "@repo/ws/message/create";
import Fastify from "fastify";

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
      const record = await Promise.all(dbs.map((db) => createUser(db, user)));
      const message = createWSMessage({ type: "insert.user", payload: record[0]! });
      broadcast(message);
    } catch (error) {
      app.log.error(error);
    }
  }, 5000);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
