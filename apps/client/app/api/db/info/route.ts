import * as postgres from "@repo/postgres/info/get";
import * as singlestore from "@repo/singlestore/info/get";
import { withMS } from "@repo/utils/with-ms";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const db = request.nextUrl.searchParams.get("db");

  let query;
  if (db === "singlestore") {
    query = () => singlestore.getDBInfo();
  } else if (db === "postgres") {
    query = () => postgres.getDBInfo();
  } else {
    throw new Error("UnknownDatabaseError");
  }

  const { value, ms } = await withMS(query);

  return NextResponse.json({ value, ms });
}
