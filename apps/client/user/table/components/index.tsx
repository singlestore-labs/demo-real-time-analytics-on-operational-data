"use client";

import type { DB } from "@repo/db/types";
import type { ListUsersOptions, ListUsersResult } from "@repo/db/user/list";
import type { WithMS } from "@repo/utils/with-ms";
import { useCallback, useEffect, useState } from "react";

import { TimeLabel } from "@/components/time-label";
import { DBTable, type DBTableProps } from "@/db/components/table";
import { cn } from "@/lib/utils";
import { USERS_TABLE_COLUMNS } from "@/user/table/columns";
import type { UsersTableData } from "@/user/table/types";

export type UsersTableProps = Omit<DBTableProps<UsersTableData>, "columns" | "data"> & { db: DB };

export function UsersTable({ className, db, ...props }: UsersTableProps) {
  const [isPending, setIsPending] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  const [data, setData] = useState<WithMS<ListUsersResult>>({
    value: [[], { limit: 10, offset: 0, count: 0 }],
    ms: undefined,
  });

  const fetchData = useCallback(
    async (options: ListUsersOptions = {}) => {
      setIsPending(true);

      try {
        const { limit = 10, offset = 0 } = options;

        const params = new URLSearchParams({
          db,
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/users?${params}`);
        const data: WithMS<ListUsersResult> = await response.json();
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

  const handlePaginationChange: DBTableProps<UsersTableData>["onPaginationChange"] = async (state) => {
    const offset = state.pageIndex * state.pageSize;
    await fetchData({ limit: state.pageSize, offset });
  };

  useEffect(() => {
    if (!hasFetched) {
      fetchData();
    }
  }, [hasFetched, fetchData]);

  return (
    <DBTable<UsersTableData>
      {...props}
      className={cn("", className)}
      title="Users"
      data={data.value[0]}
      columns={USERS_TABLE_COLUMNS}
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
