import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients } from "@/db/schema";
import { ilike, or, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    let query = db.select().from(patients).orderBy(desc(patients.createdAt));

    if (q) {
      query = query.where(
        or(
          ilike(patients.name, `%${q}%`),
          ilike(patients.email, `%${q}%`),
          ilike(patients.phone, `%${q}%`)
        )
      ) as typeof query;
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/patients error:", error);
    return NextResponse.json({ error: "Erro ao buscar pacientes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const body = await req.json();
    const { name, email, phone, cpf, birthDate, gender, address, emergencyContact, emergencyPhone, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 });
    }

    const [newPatient] = await db.insert(patients).values({
      name,
      email: email || null,
      phone,
      cpf: cpf || null,
      birthDate: birthDate || null,
      gender: gender || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
      emergencyPhone: emergencyPhone || null,
      notes: notes || null,
    }).returning();

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("POST /api/patients error:", error);
    return NextResponse.json({ error: "Erro ao criar paciente." }, { status: 500 });
  }
}
