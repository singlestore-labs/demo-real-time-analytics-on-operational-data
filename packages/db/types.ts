export type DB = "singlestore" | "postgres" | "mysql";

export type WithPagination<T extends object[]> = [T, { limit: number; offset: number; count: number }];
