import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { availability } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(availability)
      .where(eq(availability.active, true))
      .orderBy(asc(availability.dayOfWeek));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/portal/availability error:", error);
    return NextResponse.json({ error: "Erro ao buscar disponibilidade." }, { status: 500 });
  }
}
