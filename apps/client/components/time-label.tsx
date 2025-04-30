import { formatMilliseconds } from "format-ms";
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

export type TimeLabelProps = ComponentProps<"div"> & {
  label?: ReactNode;
  ms?: number;
  delay?: number;
  isPending?: boolean;
};

export function TimeLabel({ className, label, ms, delay = 400, isPending, ...props }: TimeLabelProps) {
  const [isSpinner, setIsSpinner] = useState(ms === undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPending) {
      timeoutRef.current = setTimeout(() => setIsSpinner(true), delay);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsSpinner(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [delay, isPending]);

  return (
    <p
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm",
        !isSpinner && ms !== undefined && "bg-secondary",
        className,
      )}
    >
      {isSpinner ? (
        <Spinner className="ml-auto size-[1.425em]" />
      ) : (
        ms !== undefined && (
          <>
            {label && <span>{label}</span>}
            <span>{ms ? formatMilliseconds(ms) : "0ms"}</span>
          </>
        )
      )}
    </p>
  );
}
