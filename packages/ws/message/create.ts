import type { WSMessage } from "@repo/ws/types";

export function createWSMessage<T extends WSMessage>(message: T): T {
  return message;
}
