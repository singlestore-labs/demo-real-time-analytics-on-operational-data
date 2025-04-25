import { getDBInfo } from "@repo/db/info/get";
import type { DB } from "@repo/db/types";
import { withMS } from "@repo/utils/with-ms";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const db = request.nextUrl.searchParams.get("db") as DB;
  const { value, ms } = await withMS(() => getDBInfo(db));

  return NextResponse.json({ value, ms });
}
