"use client";

import type { ListAccountsOptions, ListAccountsResult } from "@repo/db/account/list";
import type { DB } from "@repo/db/types";
import { type WithMS, withMS } from "@repo/utils/with-ms";
import { useCallback, useEffect, useState } from "react";

import { ACCOUNTS_TABLE_COLUMNS } from "@/account/table/columns";
import type { AccountsTableData } from "@/account/table/types";
import { TimeLabel } from "@/components/time-label";
import { DBTable, type DBTableProps } from "@/db/components/table";
import { cn } from "@/lib/utils";

export type AccountsTableProps = Omit<DBTableProps<AccountsTableData>, "columns" | "data"> & { db: DB };

export function AccountsTable({ className, db, ...props }: AccountsTableProps) {
  const [data, setData] = useState<WithMS<ListAccountsResult>>([[[], { limit: 10, offset: 0, count: 0 }]]);
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

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
