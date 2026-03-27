import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinicalRecords, patients } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const conditions = [];
    if (patientId) conditions.push(eq(clinicalRecords.patientId, patientId));

    const result = await db
      .select({
        record: clinicalRecords,
        patientName: patients.name,
      })
      .from(clinicalRecords)
      .leftJoin(patients, eq(clinicalRecords.patientId, patients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(clinicalRecords.sessionDate));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/clinical-records error:", error);
    return NextResponse.json({ error: "Erro ao buscar prontuários." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, sessionDate, sessionNumber, chiefComplaint, clinicalNotes, interventions, homework, mood, riskAssessment, nextSessionPlan } = body;

    if (!patientId || !clinicalNotes) {
      return NextResponse.json({ error: "Paciente e notas clínicas são obrigatórios." }, { status: 400 });
    }

    const [newRecord] = await db.insert(clinicalRecords).values({
      patientId,
      sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
      sessionNumber: sessionNumber || null,
      chiefComplaint: chiefComplaint || null,
      clinicalNotes,
      interventions: interventions || null,
      homework: homework || null,
      mood: mood || null,
      riskAssessment: riskAssessment || null,
      nextSessionPlan: nextSessionPlan || null,
      private: true,
    }).returning();

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("POST /api/clinical-records error:", error);
    return NextResponse.json({ error: "Erro ao criar prontuário." }, { status: 500 });
  }
}
