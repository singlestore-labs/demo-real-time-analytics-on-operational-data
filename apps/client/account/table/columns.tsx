import type { ColumnDef } from "@tanstack/react-table";

import type { AccountsTableData } from "@/account/table/types";

export const ACCOUNTS_TABLE_COLUMNS = [
  { accessorKey: "id" },
  { accessorKey: "userId" },
  { accessorKey: "balance" },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => row.original.createdAt && <span>{new Date(row.original.createdAt).toLocaleString("en-US")}</span>,
  },
  {
    accessorKey: "updatedAt",
    cell: ({ row }) => row.original.updatedAt && <span>{new Date(row.original.updatedAt).toLocaleString("en-US")}</span>,
  },
] satisfies ColumnDef<AccountsTableData>[];
