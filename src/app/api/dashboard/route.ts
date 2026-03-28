import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients, appointments, payments } from "@/db/schema";
import { eq, ne, count, sum, and, gte, lte, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

function todaySP(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Active patients count
    const [patientsCount] = await db.select({ count: count() }).from(patients).where(eq(patients.active, true));

    // Month sessions count
    const startStr = startOfMonth.toISOString().split("T")[0];
    const endStr = endOfMonth.toISOString().split("T")[0];
    const [sessionsCount] = await db.select({ count: count() }).from(appointments)
      .where(and(
        gte(appointments.date, startStr),
        lte(appointments.date, endStr)
      ));

    // Month revenue
    const [revenue] = await db.select({ total: sum(payments.amount) }).from(payments)
      .where(and(
        eq(payments.status, "paid"),
        gte(payments.paidAt, startOfMonth),
        lte(payments.paidAt, endOfMonth)
      ));

    // Upcoming appointments (exclude cancelled/no_show)
    const todayStr = todaySP();
    const upcoming = await db
      .select({ appointment: appointments, patientName: patients.name })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(
        and(
          gte(appointments.date, todayStr),
          ne(appointments.status, "cancelled"),
          ne(appointments.status, "no_show")
        )
      )
      .orderBy(appointments.date)
      .limit(5);

    // Pending payments
    const pendingPayments = await db
      .select({ payment: payments, patientName: patients.name })
      .from(payments)
      .leftJoin(patients, eq(payments.patientId, patients.id))
      .where(eq(payments.status, "pending"))
      .orderBy(desc(payments.createdAt))
      .limit(5);

    return NextResponse.json({
      stats: {
        activePatients: patientsCount.count,
        monthSessions: sessionsCount.count,
        monthRevenue: revenue.total || "0",
      },
      upcoming,
      pendingPayments,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Erro ao carregar dashboard." }, { status: 500 });
  }
}
