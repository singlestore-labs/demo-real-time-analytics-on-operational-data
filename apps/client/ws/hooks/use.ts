import { useContext } from "react";

import { WSContext } from "@/ws/context";

export function useWS(): WebSocket {
  const ws = useContext(WSContext);

  if (!ws) {
    throw new Error("useWS must be used within WSProvider and after connection is ready");
  }

  return ws;
}
