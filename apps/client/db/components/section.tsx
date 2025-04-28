import type { DB } from "@repo/db/types";
import { type ComponentProps, type ReactNode } from "react";

import { TopRecipientCard } from "@/account/components/top-recipient-card";
import { AccountsTable } from "@/account/table/components";
import { Separator } from "@/components/ui/separator";
import { DBInfoCard } from "@/db/info/components/card";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.svg";
import { TransactionSumCard } from "@/transaction/components/sum-card";
import { TransactionsTable } from "@/transaction/table/components";
import { UsersTable } from "@/user/table/components";

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
      className={cn("flex flex-col gap-8", className)}
    >
      <div className="min-h-8">{config.title}</div>

      <div className="flex flex-col gap-4">
        <DBInfoCard db={db} />
        <TransactionSumCard db={db} />
        <TopRecipientCard db={db} />
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <TransactionsTable db={db} />
        <AccountsTable db={db} />
        <UsersTable db={db} />
      </div>
    </section>
  );
}
