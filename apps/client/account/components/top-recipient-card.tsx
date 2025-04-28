"use client";

import { GetTopRecipientResult } from "@repo/db/account/get-top-recipient";
import type { DB } from "@repo/db/types";
import { formatNumber } from "@repo/utils/format-number";
import { WithMS, withMS } from "@repo/utils/with-ms";
import { type ComponentProps, useCallback, useEffect, useState } from "react";

import { TimeLabel } from "@/components/time-label";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type TopRecipientCardProps = ComponentProps<"div"> & { db: DB };

export function TopRecipientCard({ className, db, ...props }: TopRecipientCardProps) {
  const [data, setData] = useState<WithMS<GetTopRecipientResult>>([undefined]);
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(async () => {
    setIsPending(true);

    try {
      const params = new URLSearchParams({ db });
      const [response, ms] = await withMS(() => fetch(`/api/accounts/recipients/top?${params}`));
      const value: GetTopRecipientResult = await response.json();
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

  return (
    <Card
      {...props}
      className={cn("@container/card", className)}
    >
      <CardHeader className="relative">
        <div className="flex items-center">
          <CardDescription>The Top Recipient</CardDescription>
          <TimeLabel
            className="ml-auto"
            ms={data[1]}
            isPending={isPending}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <p className="flex items-center gap-2">
            <span className="text-sm">Account ID:</span>
            {hasFetched ? (
              <span className="text-2xl font-semibold tabular-nums">{data[0]?.accountId}</span>
            ) : (
              <Skeleton className="h-8 w-32" />
            )}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-sm">Transfers:</span>
            {hasFetched ? (
              <span className="text-2xl font-semibold tabular-nums">{formatNumber(data[0]?.count ?? 0)}</span>
            ) : (
              <Skeleton className="h-8 w-32" />
            )}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
