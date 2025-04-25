"use client";
import type { DB } from "@repo/db/types";
import { type WithMS, withMS } from "@repo/utils/with-ms";
import { type ComponentProps, useEffect, useState } from "react";

import { TimeLabel } from "@/components/time-label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DBInfo } from "@/db/info/types";
import { cn } from "@/lib/utils";

export type DBInfoCards = ComponentProps<"div"> & { db: DB };

export function DBInfoCard({ className, db, ...props }: DBInfoCards) {
  const [data, setData] = useState<WithMS<DBInfo>>([{ accounts: 0, transactions: 0, users: 0 }]);
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      (async () => {
        setIsPending(true);

        try {
          const [response, ms] = await withMS(() => fetch(`/api/db/info?${new URLSearchParams({ db })}`));
          const value = await response.json();
          setData([value, ms]);
        } catch (error) {
          console.error(error);
        } finally {
          setIsPending(false);
          setHasFetched(true);
        }
      })();
    }
  }, [db, hasFetched]);

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
              <span>
                {isPending ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value || 0)
                )}
              </span>
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
