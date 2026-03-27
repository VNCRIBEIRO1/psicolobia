import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { availability } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const result = await db.select().from(availability).orderBy(desc(availability.dayOfWeek));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/availability error:", error);
    return NextResponse.json({ error: "Erro ao buscar disponibilidade." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const body = await req.json();
    const { dayOfWeek, startTime, endTime, active } = body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Dia, hora início e hora fim são obrigatórios." }, { status: 400 });
    }

    const [newSlot] = await db.insert(availability).values({
      dayOfWeek,
      startTime,
      endTime,
      active: active ?? true,
    }).returning();

    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error("POST /api/availability error:", error);
    return NextResponse.json({ error: "Erro ao criar disponibilidade." }, { status: 500 });
  }
}
