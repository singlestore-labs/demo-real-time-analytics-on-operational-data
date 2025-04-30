"use client";

import { GetTransactionsSumResult } from "@repo/db/transaction/get-sum";
import type { DB } from "@repo/db/types";
import { toCurrency } from "@repo/utils/to-currency";
import { WithMS, withMS } from "@repo/utils/with-ms";
import { parseWSMessage } from "@repo/ws/message/parse";
import { type ComponentProps, useCallback, useEffect, useState } from "react";

import { TimeLabel } from "@/components/time-label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWS } from "@/ws/hooks/use";

export type TransactionSumCardProps = ComponentProps<"div"> & { db: DB };

export function TransactionSumCard({ className, db, ...props }: TransactionSumCardProps) {
  const [data, setData] = useState<WithMS<GetTransactionsSumResult>>([0]);
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const ws = useWS();

  const fetchData = useCallback(async () => {
    setIsPending(true);

    try {
      const params = new URLSearchParams({ db });
      const [response, ms] = await withMS(() => fetch(`/api/transactions/sum?${params}`));
      const value: GetTransactionsSumResult = await response.json();
      setData([value, ms]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
      setHasFetched(true);
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
      className={cn("@container/card", className)}
    >
      <CardHeader className="relative">
        <div className="flex items-center">
          <CardDescription>Total Transactions Amount</CardDescription>
          <TimeLabel
            className="ml-auto"
            ms={data[1]}
            isPending={isPending}
          />
        </div>
        {hasFetched ? (
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{toCurrency(data[0])}</CardTitle>
        ) : (
          <Skeleton className="h-10 w-64" />
        )}
      </CardHeader>
    </Card>
  );
}
