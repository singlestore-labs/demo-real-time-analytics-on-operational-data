"use client";

import type { ListAccountsOptions, ListAccountsResult } from "@repo/db/account/list";
import type { DB } from "@repo/db/types";
import { type WithMS, withMS } from "@repo/utils/with-ms";
import { parseWSMessage } from "@repo/ws/message/parse";
import { useCallback, useEffect, useState } from "react";

import { ACCOUNTS_TABLE_COLUMNS } from "@/account/table/columns";
import type { AccountsTableData } from "@/account/table/types";
import { TimeLabel } from "@/components/time-label";
import { DBTable, type DBTableProps } from "@/db/components/table";
import { cn } from "@/lib/utils";
import { useWS } from "@/ws/hooks/use";

export type AccountsTableProps = Omit<DBTableProps<AccountsTableData>, "columns" | "data"> & { db: DB };

export function AccountsTable({ className, db, ...props }: AccountsTableProps) {
  const [data, setData] = useState<WithMS<ListAccountsResult>>([[[], { limit: 10, offset: 0, count: 0 }]]);
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const ws = useWS();

  const fetchData = useCallback(
    async (options: ListAccountsOptions = {}) => {
      setIsPending(true);

      try {
        const { limit = 10, offset = 0 } = options;

        const params = new URLSearchParams({
          db,
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const [response, ms] = await withMS(() => fetch(`/api/accounts?${params}`));
        const value: ListAccountsResult = await response.json();
        setData([value, ms]);
      } catch (error) {
        console.error(error);
      } finally {
        setIsPending(false);
        setHasFetched(true);
      }
    },
    [db],
  );

  const handlePaginationChange: DBTableProps<AccountsTableData>["onPaginationChange"] = async (state) => {
    const offset = state.pageIndex * state.pageSize;
    await fetchData({ limit: state.pageSize, offset });
  };

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

      if (message.type === "insert.account") {
        setData((data) => {
          if (data[0][1].offset > 0) return data;
          return [[[message.payload, ...data[0][0].slice(0, -1)], { ...data[0][1], count: data[0][1].count + 1 }], data[1]];
        });
      }

      if (message.type === "update.account") {
        setData((data) => {
          const records = [...data[0][0]];
          const index = records.findIndex(({ id }) => id === message.payload.id);
          if (!index) return data;
          records[index] = message.payload;
          return [[records, data[0][1]], data[1]];
        });
      }
    };

    ws.addEventListener("message", messageHandler);

    return () => {
      ws.removeEventListener("message", messageHandler);
    };
  }, [db, ws, hasFetched]);

  return (
    <DBTable<AccountsTableData>
      {...props}
      className={cn("", className)}
      title="Accounts"
      data={data[0][0]}
      columns={ACCOUNTS_TABLE_COLUMNS}
      rowCount={data[0][1].count}
      pageIndex={Math.floor(data[0][1].offset / data[0][1].limit)}
      pageSize={data[0][1].limit}
      isDisabled={isPending}
      onPaginationChange={handlePaginationChange}
      headerClassName="flex items-center [.border-b]:pb-6 gap-2"
      headerChildren={
        <TimeLabel
          className="ml-auto"
          ms={data[1]}
          isPending={isPending}
        />
      }
    />
  );
}
