import type { ColumnDef } from "@tanstack/react-table";

import type { TransactionsTableData } from "@/transaction/table/types";

export const TRANSACTIONS_TABLE_COLUMNS = [
  { accessorKey: "id" },
  { accessorKey: "accountIdFrom" },
  { accessorKey: "accountIdTo" },
  { accessorKey: "type" },
  { accessorKey: "status" },
  { accessorKey: "amount" },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => row.original.createdAt && <span>{new Date(row.original.createdAt).toLocaleString("en-US")}</span>,
  },
  {
    accessorKey: "updatedAt",
    cell: ({ row }) => row.original.updatedAt && <span>{new Date(row.original.updatedAt).toLocaleString("en-US")}</span>,
  },
] satisfies ColumnDef<TransactionsTableData>[];
