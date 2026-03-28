import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const [row] = await db.select().from(settings).where(eq(settings.key, key));
      if (!row) return NextResponse.json({ key, value: null });
      try {
        return NextResponse.json({ key: row.key, value: JSON.parse(row.value) });
      } catch {
        return NextResponse.json({ key: row.key, value: row.value });
      }
    }

    // Return all settings
    const rows = await db.select().from(settings);
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Erro ao buscar configurações." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.response;

    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Chave é obrigatória." }, { status: 400 });
    }

    const serialized = typeof value === "string" ? value : JSON.stringify(value);

    // Upsert: try update, if not found insert
    const [existing] = await db.select().from(settings).where(eq(settings.key, key));

    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value: serialized, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return NextResponse.json(updated);
    }

    const [created] = await db
      .insert(settings)
      .values({ key, value: serialized })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração." }, { status: 500 });
  }
}
