import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, patients } from "@/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    const status = searchParams.get("status");

    const conditions = [];
    if (patientId) conditions.push(eq(appointments.patientId, patientId));
    if (status) conditions.push(eq(appointments.status, status as "pending" | "confirmed" | "cancelled" | "completed" | "no_show"));
    if (dateFrom) conditions.push(gte(appointments.date, dateFrom));
    if (dateTo) conditions.push(lte(appointments.date, dateTo));

    const result = await db
      .select({
        appointment: appointments,
        patientName: patients.name,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(appointments.date));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json({ error: "Erro ao buscar agendamentos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const body = await req.json();
    const { patientId, date, startTime, endTime, modality, notes } = body;

    if (!patientId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: "Paciente, data, hora início e hora fim são obrigatórios." }, { status: 400 });
    }

    const [newAppointment] = await db.insert(appointments).values({
      patientId,
      date,
      startTime,
      endTime,
      modality: modality || "online",
      notes: notes || null,
      status: "pending",
    }).returning();

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento." }, { status: 500 });
  }
}
