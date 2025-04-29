import { fastifyWebsocket } from "@fastify/websocket";
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
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

try {
  await app.listen({ port: 4000 });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
