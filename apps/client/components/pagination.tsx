import { cva, VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const buttonVariants = cva("", {
  variants: {
    size: {
      default: "[&_svg]:size-4",
      sm: "size-6 [&_svg]:size-3",
    },
  },
  defaultVariants: { size: "default" },
});

export type PaginationProps = ComponentProps<"div"> & {
  page: number;
  pageCount: number;
  disabled?: boolean;
  withPageCount?: boolean;
  onFirstPageClick?: () => void;
  onLastPageClick?: () => void;
  onNextPageClick?: () => void;
  onPrevPageClick?: () => void;
  pageCountProps?: ComponentProps<"div">;
} & VariantProps<typeof buttonVariants>;

export function Pagination({
  className,
  page,
  pageCount,
  size,
  disabled,
  withPageCount,
  onFirstPageClick,
  onLastPageClick,
  onNextPageClick,
  onPrevPageClick,
  pageCountProps,
  ...props
}: PaginationProps) {
  return (
    <div
      {...props}
      className={cn("flex items-center justify-center gap-4", className)}
    >
      {withPageCount && (
        <div
          {...pageCountProps}
          className={cn("flex shrink-0 items-center justify-center text-sm", pageCountProps?.className)}
        >
          Page {page} of {pageCount || 1}
        </div>
      )}

      {(onFirstPageClick || onLastPageClick || onNextPageClick || onPrevPageClick) && (
        <div className="flex items-center gap-2">
          {onFirstPageClick && (
            <Button
              variant="outline"
              size="icon"
              className={cn("hidden lg:flex", buttonVariants({ size }))}
              disabled={disabled || page === 1}
              onClick={onFirstPageClick}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft />
            </Button>
          )}

          {onPrevPageClick && (
            <Button
              className={cn("", buttonVariants({ size }))}
              variant="outline"
              size="icon"
              disabled={disabled || !(page - 1)}
              onClick={onPrevPageClick}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft />
            </Button>
          )}

          {onNextPageClick && (
            <Button
              className={cn("", buttonVariants({ size }))}
              variant="outline"
              size="icon"
              disabled={disabled || page + 1 > pageCount}
              onClick={onNextPageClick}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight />
            </Button>
          )}

          {onLastPageClick && (
            <Button
              variant="outline"
              className={cn("hidden lg:flex", buttonVariants({ size }))}
              size="icon"
              disabled={disabled || page === pageCount}
              onClick={onLastPageClick}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
