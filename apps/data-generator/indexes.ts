import { mysql } from "@repo/mysql";
import { postgres } from "@repo/postgres";
import { singlestore } from "@repo/singlestore";
import { sql } from "drizzle-orm";

const indexQueries = [
  // For the 30-day sum by status
  `CREATE INDEX idx_transactions_status_created_at ON transactions (transaction_status_id, created_at);`,

  // For “top recipient of successful transfers”
  `CREATE INDEX idx_txn_type_status_account ON transactions (transaction_type_id, transaction_status_id, account_id_to);`,

  // For efficient pagination of transactions by newest first
  `CREATE INDEX idx_txns_created_at_id ON transactions (created_at, id);`,

  // For efficient pagination of accounts by newest first
  `CREATE INDEX idx_accounts_created_at_id ON accounts (created_at, id);`,

  // For efficient pagination of users by newest first
  `CREATE INDEX idx_users_created_at_id ON users (created_at, id);`,
];

(async () => {
  await Promise.all(
    [singlestore, mysql, postgres].map(async (driver) => {
      for await (const query of indexQueries) {
        try {
          await (driver as any).execute(sql.raw(query));
        } catch (error) {
          console.error(error);
          continue;
        }
      }
    }),
  );

  process.exit(0);
})();
