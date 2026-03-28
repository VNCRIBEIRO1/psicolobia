import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments } from "@/db/schema";
import { ne, gte } from "drizzle-orm";

/**
 * Public endpoint that returns all booked slots (date + startTime)
 * for non-cancelled appointments. Used by scheduling UIs to prevent conflicts.
 * Does NOT expose patient info — only date/time.
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await db
      .select({
        date: appointments.date,
        startTime: appointments.startTime,
      })
      .from(appointments)
      .where(ne(appointments.status, "cancelled"));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/portal/booked-slots error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
