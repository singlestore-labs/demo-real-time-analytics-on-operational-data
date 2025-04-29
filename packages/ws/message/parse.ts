import type { WSMessage } from "@repo/ws/types";

export function parseWSMessage(data: string | Buffer): WSMessage {
  return JSON.parse(typeof data === "string" ? data : data.toString());
}
