import { DB } from "@repo/types/db";
import { type ComponentProps, type ReactNode } from "react";

import { DBInfoCard } from "@/db/info/components/card";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.svg";

export type DBSectionProps = ComponentProps<"section"> & { db: DB };

const DB_CONFIGS = {
  singlestore: {
    title: <Logo className="mx-auto w-40 shrink-0 [&_[fill]]:fill-current [&_[stroke]]:stroke-current" />,
  },
  postgres: {
    title: <h2 className="text-center text-xl font-medium">PostgreSQL</h2>,
  },
} satisfies Record<DB, { title: ReactNode }>;

export function DBSection({ className, db, ...props }: DBSectionProps) {
  const config = DB_CONFIGS[db];

  return (
    <section
      {...props}
      className={cn("", className)}
    >
      <div className="min-h-8">{config.title}</div>
      <DBInfoCard
        className="mt-8"
        db={db}
      />
    </section>
  );
}
