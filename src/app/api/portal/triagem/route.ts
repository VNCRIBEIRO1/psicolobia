import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { triages, appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";

/* GET /api/portal/triagem?appointmentId=xxx */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.response;

    const appointmentId = new URL(req.url).searchParams.get("appointmentId");
    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId é obrigatório." }, { status: 400 });
    }

    // Verify appointment belongs to this patient
    const [apt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId));

    if (!apt) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }

    const [triage] = await db
      .select()
      .from(triages)
      .where(eq(triages.appointmentId, appointmentId));

    return NextResponse.json(triage || null);
  } catch (error) {
    console.error("GET /api/portal/triagem error:", error);
    return NextResponse.json({ error: "Erro ao buscar triagem." }, { status: 500 });
  }
}

/* POST /api/portal/triagem — create or update triage */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.response;

    const body = await req.json();
    const {
      appointmentId,
      mood,
      sleepQuality,
      anxietyLevel,
      mainConcern,
      recentEvents,
      medicationChanges,
      additionalNotes,
    } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId é obrigatório." }, { status: 400 });
    }

    // Check if triage already exists
    const [existing] = await db
      .select()
      .from(triages)
      .where(eq(triages.appointmentId, appointmentId));

    if (existing) {
      // Update
      const [updated] = await db
        .update(triages)
        .set({
          mood,
          sleepQuality,
          anxietyLevel: anxietyLevel ? Number(anxietyLevel) : null,
          mainConcern,
          recentEvents,
          medicationChanges,
          additionalNotes,
          completed: true,
          updatedAt: new Date(),
        })
        .where(eq(triages.appointmentId, appointmentId))
        .returning();
      return NextResponse.json(updated);
    }

    // Create
    const [created] = await db
      .insert(triages)
      .values({
        appointmentId,
        mood,
        sleepQuality,
        anxietyLevel: anxietyLevel ? Number(anxietyLevel) : null,
        mainConcern,
        recentEvents,
        medicationChanges,
        additionalNotes,
        completed: true,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/portal/triagem error:", error);
    return NextResponse.json({ error: "Erro ao salvar triagem." }, { status: 500 });
  }
}
