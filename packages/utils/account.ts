import { faker } from "@faker-js/faker";
import type { AccountRecord, AccountValues } from "@repo/types/account";

export function generateAccount<T extends AccountValues>(values?: T) {
  const now = new Date();

  return {
    id: values?.id,
    userId: values?.userId,
    balance: values?.balance ?? faker.finance.amount({ dec: 2 }),
    createdAt: values?.createdAt ?? now,
    updatedAt: values?.updatedAt ?? now,
  } as T["id"] extends number ? AccountRecord : AccountValues;
}
