"use client";

import type { ListAccountsOptions, ListAccountsResult } from "@repo/db/account/list";
import type { DB } from "@repo/db/types";
import type { WithMS } from "@repo/utils/with-ms";
import { useCallback, useEffect, useState } from "react";

import { ACCOUNTS_TABLE_COLUMNS } from "@/account/table/columns";
import type { AccountsTableData } from "@/account/table/types";
import { TimeLabel } from "@/components/time-label";
import { DBTable, type DBTableProps } from "@/db/components/table";
import { cn } from "@/lib/utils";

export type AccountsTableProps = Omit<DBTableProps<AccountsTableData>, "columns" | "data"> & { db: DB };

export function AccountsTable({ className, db, ...props }: AccountsTableProps) {
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const [data, setData] = useState<WithMS<ListAccountsResult>>({
    value: [[], { limit: 10, offset: 0, count: 0 }],
    ms: undefined,
  });

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

        const response = await fetch(`/api/accounts?${params}`);
        const data: WithMS<ListAccountsResult> = await response.json();
        setData({ value: data.value, ms: data.ms });
        setHasFetched(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsPending(false);
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

  return (
    <DBTable<AccountsTableData>
      {...props}
      className={cn("", className)}
      title="Accounts"
      data={data.value[0]}
      columns={ACCOUNTS_TABLE_COLUMNS}
      rowCount={data.value[1].count}
      pageIndex={Math.floor(data.value[1].offset / data.value[1].limit)}
      pageSize={data.value[1].limit}
      isDisabled={isPending}
      onPaginationChange={handlePaginationChange}
      headerClassName="flex items-center [.border-b]:pb-6 gap-2"
      headerChildren={
        <TimeLabel
          className="ml-auto"
          ms={data.ms}
          isPending={isPending}
        />
      }
    />
  );
}
