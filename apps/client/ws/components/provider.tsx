"use client";

import { parseWSMessage } from "@repo/ws/message/parse";
import { type ReactNode, useEffect, useState } from "react";

import { WSContext } from "@/ws/context";

export type WSProviderProps = {
  children?: ReactNode;
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

export function WSProvider({ children }: WSProviderProps) {
  const [ws, setWS] = useState<WebSocket | null>(null);

  useEffect(() => {
    const url = new URL(SERVER_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    const ws = new WebSocket(url);

    ws.addEventListener("open", () => {
      console.log("WebSocket connected to", url);
    });

    ws.addEventListener("message", (event) => {
      try {
        const message = parseWSMessage(event.data);
        console.log("Received WebSocket message:", message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", event.data, error);
      }
    });

    ws.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });

    ws.addEventListener("close", (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
    });

    setWS(ws);

    return () => {
      ws.close();
    };
  }, []);

  return <WSContext.Provider value={ws}>{children}</WSContext.Provider>;
}
