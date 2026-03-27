import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (error) {
    console.error("GET /api/patients/[id] error:", error);
    return NextResponse.json({ error: "Erro ao buscar paciente." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, cpf, birthDate, gender, address, emergencyContact, emergencyPhone, notes, active } = body;

    const [updated] = await db.update(patients).set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(cpf !== undefined && { cpf }),
      ...(birthDate !== undefined && { birthDate }),
      ...(gender !== undefined && { gender }),
      ...(address !== undefined && { address }),
      ...(emergencyContact !== undefined && { emergencyContact }),
      ...(emergencyPhone !== undefined && { emergencyPhone }),
      ...(notes !== undefined && { notes }),
      ...(active !== undefined && { active }),
      updatedAt: new Date(),
    }).where(eq(patients.id, id)).returning();

    if (!updated) {
      return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/patients/[id] error:", error);
    return NextResponse.json({ error: "Erro ao atualizar paciente." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [deleted] = await db.delete(patients).where(eq(patients.id, id)).returning();
    if (!deleted) {
      return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ message: "Paciente removido." });
  } catch (error) {
    console.error("DELETE /api/patients/[id] error:", error);
    return NextResponse.json({ error: "Erro ao remover paciente." }, { status: 500 });
  }
}
