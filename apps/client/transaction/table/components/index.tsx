"use client";

import type { ListTransactionsOptions, ListTransactionsResult } from "@repo/db/transaction/list";
import type { DB } from "@repo/db/types";
import { type WithMS, withMS } from "@repo/utils/with-ms";
import { useCallback, useEffect, useState } from "react";

import { TimeLabel } from "@/components/time-label";
import { DBTable, type DBTableProps } from "@/db/components/table";
import { cn } from "@/lib/utils";
import { TRANSACTIONS_TABLE_COLUMNS } from "@/transaction/table/columns";
import type { TransactionsTableData } from "@/transaction/table/types";

export type TransactionsTableProps = Omit<DBTableProps<TransactionsTableData>, "columns" | "data"> & { db: DB };

export function TransactionsTable({ className, db, ...props }: TransactionsTableProps) {
  const [data, setData] = useState<WithMS<ListTransactionsResult>>([[[], { limit: 10, offset: 0, count: 0 }]]);
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchData = useCallback(
    async (options: ListTransactionsOptions = {}) => {
      setIsPending(true);

      try {
        const { limit = 10, offset = 0 } = options;

        const params = new URLSearchParams({
          db,
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const [response, ms] = await withMS(() => fetch(`/api/transactions?${params}`));
        const value: ListTransactionsResult = await response.json();
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

  const handlePaginationChange: DBTableProps<TransactionsTableData>["onPaginationChange"] = async (state) => {
    const offset = state.pageIndex * state.pageSize;
    await fetchData({ limit: state.pageSize, offset });
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchData();
    }
  }, [hasFetched, fetchData]);

  return (
    <DBTable<TransactionsTableData>
      {...props}
      className={cn("", className)}
      title="Transactions"
      data={data[0][0]}
      columns={TRANSACTIONS_TABLE_COLUMNS}
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
