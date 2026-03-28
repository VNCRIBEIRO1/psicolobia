import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, patients } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.response;

    const userId = auth.session!.user.id;

    // Find the patient record linked to this user
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, userId))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Registro de paciente não encontrado." }, { status: 404 });
    }

    const result = await db
      .select({
        appointment: appointments,
        patientName: patients.name,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(eq(appointments.patientId, patient.id))
      .orderBy(desc(appointments.date));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/portal/appointments error:", error);
    return NextResponse.json({ error: "Erro ao buscar agendamentos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.response;

    const userId = auth.session!.user.id;

    // Find the patient record linked to this user
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, userId))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Registro de paciente não encontrado." }, { status: 404 });
    }

    const body = await req.json();
    const { date, startTime, endTime, modality, notes } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Data, hora início e hora fim são obrigatórios." },
        { status: 400 }
      );
    }

    // Check for booking conflicts (exclude cancelled appointments)
    const existing = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.date, date),
          eq(appointments.startTime, startTime),
          ne(appointments.status, "cancelled"),
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Este horário já está ocupado. Escolha outro horário." },
        { status: 409 }
      );
    }

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        patientId: patient.id,
        date,
        startTime,
        endTime,
        modality: modality || "online",
        notes: notes || null,
        status: "pending",
      })
      .returning();

    // Notify admin about new appointment from patient
    await createNotification({
      type: "appointment",
      title: "Novo agendamento",
      message: `${patient.name} solicitou agendamento para ${date} às ${startTime}.`,
      patientId: patient.id,
      appointmentId: newAppointment.id,
      linkUrl: `/admin/agenda`,
    });

    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error("POST /api/portal/appointments error:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento." }, { status: 500 });
  }
}
