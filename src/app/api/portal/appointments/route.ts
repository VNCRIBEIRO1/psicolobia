import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, patients, availability, blockedDates } from "@/db/schema";
import { eq, desc, and, ne, lt, gt } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";

function todaySP(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

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

    // H4: Validate date is not in the past
    const today = todaySP();
    if (date < today) {
      return NextResponse.json(
        { error: "N\u00e3o \u00e9 poss\u00edvel agendar em datas passadas." },
        { status: 400 }
      );
    }

    // H3: Check if date is blocked
    const [blocked] = await db
      .select({ id: blockedDates.id })
      .from(blockedDates)
      .where(eq(blockedDates.date, date))
      .limit(1);

    if (blocked) {
      return NextResponse.json(
        { error: "Esta data est\u00e1 bloqueada para agendamentos." },
        { status: 409 }
      );
    }

    // H3: Check if time falls within configured availability
    const dow = new Date(date + "T00:00:00").getDay();
    const availSlots = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.dayOfWeek, dow),
          eq(availability.active, true)
        )
      );

    const withinAvailability = availSlots.some(
      (s) => startTime >= s.startTime && endTime <= s.endTime
    );

    if (!withinAvailability) {
      return NextResponse.json(
        { error: "Hor\u00e1rio fora da disponibilidade configurada." },
        { status: 409 }
      );
    }

    // H2: Check for overlapping appointments (time-range overlap, not just exact match)
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
