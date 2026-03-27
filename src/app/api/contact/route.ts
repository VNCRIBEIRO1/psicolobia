import { NextRequest, NextResponse } from "next/server";

// In-memory store for contact submissions (in production, save to DB or send email)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Nome, email e mensagem são obrigatórios." }, { status: 400 });
    }

    // Log the contact (in production, save to DB or send via email service)
    console.log("📬 Novo contato:", { name, email, subject, message, timestamp: new Date().toISOString() });

    return NextResponse.json({ message: "Mensagem recebida com sucesso!" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 });
  }
}
