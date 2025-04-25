import type { ColumnDef } from "@tanstack/react-table";

import type { UsersTableData } from "@/user/table/types";

export const USERS_TABLE_COLUMNS = [
  { accessorKey: "id" },
  { accessorKey: "name" },
  { accessorKey: "email" },
  { accessorKey: "createdAt" },
] satisfies ColumnDef<UsersTableData>[];
