"use client";
import type { DB } from "@repo/db/types";
import { formatNumber } from "@repo/utils/format-number";
import { type WithMS, withMS } from "@repo/utils/with-ms";
import { parseWSMessage } from "@repo/ws/message/parse";
import { type ComponentProps, useCallback, useEffect, useRef, useState } from "react";

import { TimeLabel } from "@/components/time-label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DBInfo } from "@/db/info/types";
import { cn } from "@/lib/utils";
import { useWS } from "@/ws/hooks/use";

export type DBInfoCards = ComponentProps<"div"> & { db: DB };

export function DBInfoCard({ className, db, ...props }: DBInfoCards) {
  const [data, setData] = useState<WithMS<DBInfo>>([{ accounts: 0, transactions: 0, users: 0 }]);
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const ws = useWS();
  const isPendingRef = useRef(isPending);

  const fetchData = useCallback(async () => {
    setIsPending(true);
    isPendingRef.current = true;

    try {
      const [response, ms] = await withMS(() => fetch(`/api/db/info?${new URLSearchParams({ db })}`));
      const value = await response.json();
      setData([value, ms]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
      setHasFetched(true);
      isPendingRef.current = false;
    }
  }, [db]);

  useEffect(() => {
    if (!hasFetched) {
      fetchData();
    }
  }, [hasFetched, fetchData]);

  useEffect(() => {
    if (!ws || !hasFetched) return;

    const messageHandler = (event: MessageEvent) => {
      if (isPendingRef.current) return;

      const message = parseWSMessage(event.data);
      if (message.db !== db) return;

      if (message.type === "insert.transaction") {
        fetchData();
      }
    };

    ws.addEventListener("message", messageHandler);

    return () => {
      ws.removeEventListener("message", messageHandler);
    };
  }, [db, ws, hasFetched, fetchData]);

  return (
    <Card
      {...props}
      className={cn("", className)}
    >
      <CardContent className="flex flex-wrap items-center gap-2">
        <ul className="flex flex-wrap gap-4 text-sm max-md:flex-col max-md:gap-1">
          {Object.entries({
            Users: data[0].users,
            Accounts: data[0].accounts,
            Transactions: data[0].transactions,
          }).map(([key, value]) => (
            <li
              key={key}
              className="flex items-center gap-1"
            >
              <span className="font-medium">{key}:</span>
              <span>{!hasFetched ? <Skeleton className="h-6 w-12" /> : formatNumber(value ?? 0)}</span>
            </li>
          ))}
        </ul>

        <TimeLabel
          className="ml-auto"
          ms={data[1]}
          isPending={isPending}
        />
      </CardContent>
    </Card>
  );
}
