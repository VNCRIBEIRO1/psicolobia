import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/notifications";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("GET /api/appointments/[id] error:", error);
    return NextResponse.json({ error: "Erro ao buscar agendamento." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { date, startTime, endTime, modality, status, notes, meetingUrl } = body;

    // Get current appointment to detect status changes
    const [current] = await db.select().from(appointments).where(eq(appointments.id, id));

    const [updated] = await db.update(appointments).set({
      ...(date !== undefined && { date }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(modality !== undefined && { modality }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(meetingUrl !== undefined && { meetingUrl }),
      updatedAt: new Date(),
    }).where(eq(appointments.id, id)).returning();

    if (!updated) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }

    // Notify on status change
    if (status !== undefined && current && current.status !== status) {
      const statusLabels: Record<string, string> = {
        pending: "Pendente", confirmed: "Confirmada", cancelled: "Cancelada",
        completed: "Realizada", no_show: "Não compareceu",
      };
      const [pat] = await db.select({ name: patients.name }).from(patients).where(eq(patients.id, updated.patientId));
      await createNotification({
        type: "status_change",
        title: `Sessão ${statusLabels[status] || status}`,
        message: `Sessão de ${pat?.name || "paciente"} em ${updated.date} atualizada: ${statusLabels[current.status] || current.status} → ${statusLabels[status] || status}.`,
        patientId: updated.patientId,
        appointmentId: updated.id,
        linkUrl: `/admin/agenda`,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/appointments/[id] error:", error);
    return NextResponse.json({ error: "Erro ao atualizar agendamento." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ message: "Agendamento removido." });
  } catch (error) {
    console.error("DELETE /api/appointments/[id] error:", error);
    return NextResponse.json({ error: "Erro ao remover agendamento." }, { status: 500 });
  }
}
