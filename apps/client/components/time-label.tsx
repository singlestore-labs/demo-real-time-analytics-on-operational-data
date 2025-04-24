import { formatMilliseconds } from "format-ms";
import type { ComponentProps, ReactNode } from "react";

import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

export type TimeLabelProps = ComponentProps<"div"> & { label?: ReactNode; ms?: number; isPending?: boolean };

export function TimeLabel({ className, label, ms, isPending, ...props }: TimeLabelProps) {
  return (
    <p
      {...props}
      className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm", !isPending && "bg-secondary", className)}
    >
      {isPending ? (
        <Spinner className="ml-auto size-[1.425em]" />
      ) : (
        <>
          {label && <span>{label}</span>}
          <span>{ms ? formatMilliseconds(ms) : "0ms"}</span>
        </>
      )}
    </p>
  );
}
