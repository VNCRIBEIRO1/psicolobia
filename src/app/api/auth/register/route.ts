import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "patient",
      phone: phone || null,
    }).returning();

    // Also create the patients record linked to this user
    await db.insert(patients).values({
      userId: newUser.id,
      name,
      email,
      phone: phone || "",
    });

    return NextResponse.json({ message: "Conta criada com sucesso!" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
