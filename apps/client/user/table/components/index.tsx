"use client";

import type { DB } from "@repo/db/types";
import { WithMS } from "@repo/utils/with-ms";
import { useCallback, useState } from "react";

import { DBTable, type DBTableProps } from "@/db/components/table";
import { cn } from "@/lib/utils";
import { UsersTableData } from "@/user/table/types";

export type UsersTableProps = Omit<DBTableProps<UsersTableData>, "columns" | "data"> & { db: DB };

export function UsersTable({ className, db, ...props }: UsersTableProps) {
  const [data, setData] = useState<WithMS<UsersTableData[]>>({
    value: [
      { id: 1, name: "Test" },
      { id: 2, name: "Test" },
      { id: 3, name: "Test" },
      { id: 4, name: "Test" },
      { id: 5, name: "Test" },
      { id: 6, name: "Test" },
      { id: 7, name: "Test" },
      { id: 8, name: "Test" },
      { id: 9, name: "Test" },
      { id: 10, name: "Test" },
    ],
    ms: 1000,
  });

  const fetchData = useCallback(async () => {}, []);

  const handlePaginationChange: DBTableProps<UsersTableData>["onPaginationChange"] = async (state) => {
    const data = await fetchData({ page: state.pageIndex + 1, pageSize: state.pageSize });
    setData(data);
  };

  return (
    <DBTable<UsersTableData>
      {...props}
      className={cn("", className)}
      title="Users"
      data={data.value}
      columns={[{ accessorKey: "id" }, { accessorKey: "name" }]}
      rowCount={data.value.length + 2}
      isDisabled={false}
      onPaginationChange={handlePaginationChange}
    />
  );
}
