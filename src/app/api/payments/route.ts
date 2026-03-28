import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, patients } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    const conditions = [];
    if (patientId) conditions.push(eq(payments.patientId, patientId));
    if (status) conditions.push(eq(payments.status, status as "pending" | "paid" | "overdue" | "cancelled" | "refunded"));

    const result = await db
      .select({
        payment: payments,
        patientName: patients.name,
      })
      .from(payments)
      .leftJoin(patients, eq(payments.patientId, patients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(payments.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Erro ao buscar pagamentos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const body = await req.json();
    const { patientId, appointmentId, amount, method, dueDate, description } = body;

    if (!patientId || !amount) {
      return NextResponse.json({ error: "Paciente e valor são obrigatórios." }, { status: 400 });
    }

    const [newPayment] = await db.insert(payments).values({
      patientId,
      appointmentId: appointmentId || null,
      amount: String(amount),
      method: method || "pix",
      dueDate: dueDate || null,
      description: description || null,
      status: "pending",
    }).returning();

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Erro ao criar pagamento." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const body = await req.json();
    const { id, status, paidAt, method, amount, dueDate, description } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do pagamento é obrigatório." }, { status: 400 });
    }

    const [updated] = await db.update(payments).set({
      ...(status !== undefined && { status }),
      ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
      ...(method !== undefined && { method }),
      ...(amount !== undefined && { amount: String(amount) }),
      ...(dueDate !== undefined && { dueDate }),
      ...(description !== undefined && { description }),
    }).where(eq(payments.id, id)).returning();

    if (!updated) {
      return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/payments error:", error);
    return NextResponse.json({ error: "Erro ao atualizar pagamento." }, { status: 500 });
  }
}
