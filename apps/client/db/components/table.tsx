"use client";

import { type ColumnDef, getCoreRowModel, OnChangeFn, PaginationState, useReactTable } from "@tanstack/react-table";
import { type ReactNode, useState } from "react";

import { DataTable } from "@/components/data-table";
import { DataTablePagination } from "@/components/data-table/pagination";
import { Card, CardContent, CardFooter, CardHeader, type CardProps, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DBTableProps<TData> = CardProps & {
  title?: ReactNode;
  data: TData[];
  columns: ColumnDef<TData>[];
  rowCount?: number;
  pageIndex?: number;
  pageSize?: number;
  isDisabled?: boolean;
  onPaginationChange?: (state: PaginationState) => void;
};

export function DBTable<TData>({
  className,
  title,
  data,
  columns,
  rowCount,
  pageIndex = 0,
  pageSize = 10,
  isDisabled,
  onPaginationChange,
  ...props
}: DBTableProps<TData>) {
  const [pagination, setPagination] = useState({ pageIndex, pageSize });

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    setPagination((prevState) => {
      const state = typeof updater === "function" ? updater(prevState) : updater;
      onPaginationChange?.(state);
      return state;
    });
  };

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    rowCount,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: handlePaginationChange,
  });

  return (
    <Card
      {...props}
      className={cn("gap-0", className)}
    >
      <CardHeader className="border-b">
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <DataTable<TData>
          table={table}
          columnCount={columns.length}
        />
      </CardContent>
      <CardFooter className="border-t text-sm">
        <DataTablePagination<TData>
          className="w-full justify-between"
          table={table}
          rowCount={rowCount}
          isDisabled={isDisabled}
        />
      </CardFooter>
    </Card>
  );
}
