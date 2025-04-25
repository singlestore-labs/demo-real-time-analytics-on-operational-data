"use client";
import type { DB } from "@repo/db/types";
import type { WithMS } from "@repo/utils/with-ms";
import { type ComponentProps, useEffect, useState } from "react";

import { TimeLabel } from "@/components/time-label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DBInfo } from "@/db/info/types";
import { cn } from "@/lib/utils";

export type DBInfoCards = ComponentProps<"div"> & { db: DB };

export function DBInfoCard({ className, db, ...props }: DBInfoCards) {
  const [data, setData] = useState<WithMS<DBInfo> | undefined>();
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (!data) {
      (async () => {
        try {
          setIsPending(true);
          const response = await fetch(`/api/db/info?${new URLSearchParams({ db }).toString()}`);
          const data = await response.json();
          setData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsPending(false);
        }
      })();
    }
  }, [data, db]);

  return (
    <Card
      {...props}
      className={cn("", className)}
    >
      <CardContent className="flex flex-wrap items-center gap-2">
        <ul className="flex flex-wrap gap-4 text-sm max-md:flex-col max-md:gap-1">
          {Object.entries({
            Users: data?.value.users,
            Accounts: data?.value.accounts,
            Transactions: data?.value.transactions,
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
          ms={data?.ms}
          isPending={isPending}
        />
      </CardContent>
    </Card>
  );
}
