import { and, asc, desc, eq, getTableColumns, gte, inArray, isNull, like, lte, type SQL, sql } from "drizzle-orm";

export type ListUsersOptions = {
  limit?: number;
  offset?: number;
};

export async function listUsers(options: ListUsersOptions = {}): Promise<WithPagination<Campaign[]>> {
  const {
    organizationId,
    userId,
    name,
    statuses,
    startFrom,
    startTo,
    endFrom,
    endTo,
    createdFrom,
    createdTo,
    includeDeleted = false,
    includeArchived = false,
    sort,
    limit = 10,
    offset = 0,
  } = options;

  const query = db
    .select({
      ...getTableColumns(campaignsTable),
      count: sql<number>`count(${campaignsTable.id}) OVER ()`.as("count"),
    })
    .from(campaignsTable);

  const whereClauses: SQL[] = [];

  if (organizationId) {
    whereClauses.push(eq(campaignsTable.organizationId, organizationId));
  }

  if (userId) {
    whereClauses.push(eq(campaignsTable.userId, userId));
  }

  if (name) {
    whereClauses.push(like(campaignsTable.name, `%${name}%`));
  }

  if (statuses?.length) {
    whereClauses.push(inArray(campaignsTable.status, statuses));
  }

  if (startFrom) {
    whereClauses.push(gte(campaignsTable.startAt, startFrom));
  }

  if (startTo) {
    whereClauses.push(lte(campaignsTable.startAt, startTo));
  }

  if (endFrom) {
    whereClauses.push(gte(campaignsTable.endAt, endFrom));
  }

  if (endTo) {
    whereClauses.push(lte(campaignsTable.endAt, endTo));
  }

  if (createdFrom) {
    whereClauses.push(gte(campaignsTable.createdAt, createdFrom));
  }

  if (createdTo) {
    whereClauses.push(lte(campaignsTable.createdAt, createdTo));
  }

  if (!includeDeleted) {
    whereClauses.push(isNull(campaignsTable.deletedAt));
  }

  if (!includeArchived) {
    whereClauses.push(isNull(campaignsTable.archivedAt));
  }

  if (whereClauses.length) {
    query.where(and(...whereClauses));
  }

  if (sort) {
    const direction = { asc, desc }[sort.direction];
    query.orderBy(direction(campaignsTable[sort.field]));
  }

  query.limit(limit).offset(offset);

  const result = await query;

  return [result, { limit, offset, count: result[0]?.count || 0 }];
}
