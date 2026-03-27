import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const conditions = [];
    if (status) conditions.push(eq(blogPosts.status, status as "draft" | "published" | "archived"));
    if (category) conditions.push(ilike(blogPosts.category, category));

    const result = await db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/blog error:", error);
    return NextResponse.json({ error: "Erro ao buscar posts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, excerpt, category, coverImage, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios." }, { status: 400 });
    }

    const slug = slugify(title);

    // Check slug uniqueness
    const existing = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Já existe um post com esse título." }, { status: 409 });
    }

    const [newPost] = await db.insert(blogPosts).values({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      category: category || null,
      coverImage: coverImage || null,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
    }).returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("POST /api/blog error:", error);
    return NextResponse.json({ error: "Erro ao criar post." }, { status: 500 });
  }
}
