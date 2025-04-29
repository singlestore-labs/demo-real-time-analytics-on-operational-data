import { createContext } from "react";

export const WSContext = createContext<WebSocket | null>(null);
