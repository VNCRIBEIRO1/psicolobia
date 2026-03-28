import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blockedDates } from "@/db/schema";
import { gte } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await db
      .select({ date: blockedDates.date, reason: blockedDates.reason })
      .from(blockedDates)
      .where(gte(blockedDates.date, today));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/portal/blocked-dates error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
