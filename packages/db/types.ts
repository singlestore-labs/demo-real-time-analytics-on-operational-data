export type DB = "singlestore" | "postgres";

export type WithPagination<T extends object[]> = [T, { limit: number; offset: number; count: number }];
