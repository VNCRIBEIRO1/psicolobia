import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user?.role !== "admin" && session.user?.role !== "therapist")) {
    return { error: true, response: NextResponse.json({ error: "Não autorizado." }, { status: 401 }) };
  }
  return { error: false, session };
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: true, response: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  }
  return { error: false, session };
}
