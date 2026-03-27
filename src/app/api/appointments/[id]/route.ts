import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";

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
