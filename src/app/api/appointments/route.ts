import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, patients } from "@/db/schema";
import { eq, ne, desc, and, gte, lte, lt, gt } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";

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
        patientPhone: patients.phone,
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

    // M1: Check for overlapping appointments (same logic as portal)
    const overlapping = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.date, date),
          ne(appointments.status, "cancelled"),
          lt(appointments.startTime, endTime),
          gt(appointments.endTime, startTime)
        )
      )
      .limit(1);

    if (overlapping.length > 0) {
      return NextResponse.json({ error: "Conflito de horário: já existe um agendamento nesse período." }, { status: 409 });
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

    // Get patient name for notification
    const [pat] = await db.select({ name: patients.name }).from(patients).where(eq(patients.id, patientId));
    await createNotification({
      type: "appointment",
      title: "Sessão agendada",
      message: `Sessão agendada para ${pat?.name || "paciente"} em ${date} às ${startTime}.`,
      patientId,
      appointmentId: newAppointment.id,
      linkUrl: `/admin/agenda`,
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento." }, { status: 500 });
  }
}
