import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const { id } = await params;
    const { email, password } = await req.json();

    // Get the patient record
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado." }, { status: 404 });
    }

    if (patient.userId) {
      return NextResponse.json({ error: "Este paciente já possui acesso ao portal." }, { status: 409 });
    }

    const accountEmail = email || patient.email;
    if (!accountEmail) {
      return NextResponse.json({ error: "E-mail é obrigatório para criar acesso." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Senha com pelo menos 6 caracteres é obrigatória." }, { status: 400 });
    }

    // Check if user with this email already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, accountEmail)).limit(1);
    if (existingUser) {
      return NextResponse.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [newUser] = await db.insert(users).values({
      name: patient.name,
      email: accountEmail,
      password: hashedPassword,
      role: "patient",
      phone: patient.phone || null,
    }).returning();

    // Link user to patient and sync email
    await db.update(patients).set({
      userId: newUser.id,
      email: accountEmail,
      updatedAt: new Date(),
    }).where(eq(patients.id, id));

    return NextResponse.json({ message: "Acesso ao portal criado com sucesso!", userId: newUser.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/patients/[id]/create-account error:", error);
    return NextResponse.json({ error: "Erro ao criar acesso." }, { status: 500 });
  }
}
