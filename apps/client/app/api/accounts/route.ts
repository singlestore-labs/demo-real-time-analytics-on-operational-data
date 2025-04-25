import { listAccounts } from "@repo/db/account/list";
import type { DB } from "@repo/db/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const db = request.nextUrl.searchParams.get("db") as DB;
  const limit = +(request.nextUrl.searchParams.get("limit") ?? 10);
  const offset = +(request.nextUrl.searchParams.get("offset") ?? 0);
  const result = await listAccounts(db, { limit, offset });

  return NextResponse.json(result);
}
