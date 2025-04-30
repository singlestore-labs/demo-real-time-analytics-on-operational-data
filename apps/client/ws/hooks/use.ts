import { useContext } from "react";

import { WSContext } from "@/ws/context";

export function useWS(): WebSocket | null {
  return useContext(WSContext);
}
