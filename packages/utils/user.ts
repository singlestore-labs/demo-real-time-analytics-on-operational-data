import { faker } from "@faker-js/faker";
import type { UserRecord, UserValues } from "@repo/db/user/types";

export function generateUser<T extends UserValues>(values?: T) {
  const now = new Date();

  return {
    id: values?.id,
    email: values?.email ?? faker.internet.email(),
    name: values?.name ?? faker.person.fullName(),
    createdAt: values?.createdAt ?? now,
    updatedAt: values?.updatedAt ?? now,
  } as T["id"] extends number ? UserRecord : UserValues;
}
