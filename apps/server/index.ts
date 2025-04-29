import { fastifyWebsocket } from "@fastify/websocket";
import { parseWSMessage } from "@repo/ws/message/parse";
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.register(fastifyWebsocket);

app.register(async function (app) {
  app.get("/", { websocket: true }, (ws, req) => {
    ws.on("message", async (data: string | Buffer) => {
      try {
        const message = parseWSMessage(data);
        console.log(message);
      } catch (error) {
        app.log.error("Error processing WebSocket message:", error);
      }
    });
  });
});

try {
  await app.listen({ port: 4000 });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
