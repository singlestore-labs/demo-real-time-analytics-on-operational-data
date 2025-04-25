import { getDBInfo } from "@repo/db/info/get";
import type { DB } from "@repo/db/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const db = request.nextUrl.searchParams.get("db") as DB;
  const result = await getDBInfo(db);

  return NextResponse.json(result);
}
