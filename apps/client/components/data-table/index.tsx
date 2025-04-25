"use client";

import { flexRender, type Table as TTable } from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, type TableProps, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableProps<TData> = TableProps & {
  table: TTable<TData>;
  columnCount: number;
};

export function DataTable<TData>({ table, columnCount, ...props }: DataTableProps<TData>) {
  return (
    <Table {...props}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header, i, array) => (
              <TableHead
                key={header.id}
                className={cn(i === 0 && "pl-6", i === array.length - 1 && "pr-6")}
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell, i, array) => (
                <TableCell
                  key={cell.id}
                  className={cn(i === 0 && "pl-6", i === array.length - 1 && "pr-6")}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
