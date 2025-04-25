import { Table } from "@tanstack/react-table";
import type { ComponentProps } from "react";

import { Pagination } from "@/components/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DataTablePaginationProps<TData> = ComponentProps<"div"> & {
  table: Table<TData>;
  rowCount?: number;
  isDisabled?: boolean;
};

const pageSizeOptions = [10, 20, 50, 100];

export function DataTablePagination<TData>({
  className,
  table,
  rowCount,
  isDisabled,
  ...props
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div
      {...props}
      className={cn("flex items-center space-x-4 lg:space-x-8", className)}
    >
      <div className="flex items-center space-x-2">
        <p className="shrink-0 text-sm">Rows per page</p>

        <Select
          value={pageSize.toString()}
          disabled={isDisabled}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[4.5rem]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((option) => (
              <SelectItem
                key={option}
                value={option.toString()}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!!rowCount && rowCount > pageSize && (
        <Pagination
          page={pageIndex + 1}
          pageCount={table.getPageCount() || 1}
          disabled={isDisabled}
          onFirstPageClick={() => table.setPageIndex(0)}
          onPrevPageClick={() => table.previousPage()}
          onNextPageClick={() => table.nextPage()}
          onLastPageClick={() => table.setPageIndex(table.getPageCount() - 1)}
        />
      )}
    </div>
  );
}
