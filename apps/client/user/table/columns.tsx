import type { ColumnDef } from "@tanstack/react-table";

import type { UsersTableData } from "@/user/table/types";

export const USERS_TABLE_COLUMNS = [
  { accessorKey: "id" },
  { accessorKey: "name" },
  { accessorKey: "email" },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => row.original.createdAt && <span>{new Date(row.original.createdAt).toLocaleString("en-US")}</span>,
  },
] satisfies ColumnDef<UsersTableData>[];
