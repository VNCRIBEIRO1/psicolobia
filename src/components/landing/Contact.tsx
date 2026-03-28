"use client";
import { useState } from "react";
import { WHATSAPP_LINK, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/utils";

export function Contact() {
  const [toast, setToast] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });
      if (res.ok) {
        setToast("✅ Mensagem enviada! Retornaremos com carinho em breve 🌿");
        form.reset();
      } else {
        setToast("⚠️ Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.");
      }
    } catch {
      setToast("⚠️ Erro de conexão. Tente novamente.");
    } finally {
      setSending(false);
      setTimeout(() => setToast(""), 4000);
    }
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-white" id="contato">
      <div className="max-w-[1100px] mx-auto">
        <div className="section-label">Contato</div>
        <h2 className="section-title">Vamos Conversar?</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-10">
          {/* Info cards */}
          <div className="space-y-3">
            {[
              { icon: "📱", title: "WhatsApp", content: "(11) 98884-0525", href: WHATSAPP_LINK },
              { icon: "📸", title: "Instagram", content: "@psicolobiaa", href: INSTAGRAM_URL },
              { icon: "🎵", title: "TikTok", content: "@psicolobiaa", href: TIKTOK_URL },
              { icon: "💻", title: "Atendimento Online", content: "Terapia por videochamada em todo o Brasil" },
            ].map((c, i) => (
              <div key={i} className="flex gap-3.5 p-4 bg-bg rounded-brand-sm hover:shadow-md transition-shadow">
                <div className="w-[42px] h-[42px] bg-bg-soft rounded-full flex items-center justify-center text-lg shrink-0">
                  {c.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{c.title}</h4>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener" className="text-xs text-primary-dark hover:underline">
                      {c.content}
                    </a>
                  ) : (
                    <p className="text-xs text-txt-light">{c.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-bg rounded-brand p-8">
            <h3 className="font-heading text-lg font-semibold mb-5">💌 Mensagem</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Nome *</label>
                <input type="text" name="name" required placeholder="Seu nome"
                  className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">E-mail *</label>
                <input type="email" name="email" required placeholder="seu@email.com"
                  className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Assunto</label>
                <select name="subject" className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option>Agendar sessão</option>
                  <option>Grupo terapêutico</option>
                  <option>Terapia de Aceitação e Compromisso (ACT)</option>
                  <option>Dúvida</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Mensagem *</label>
                <textarea name="message" required placeholder="Como posso te acolher?" rows={3}
                  className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
              </div>
              <button type="submit" disabled={sending} className="btn-brand-primary w-full justify-center">
                {sending ? "Enviando..." : "Enviar com Carinho 🌿"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-4 rounded-brand-sm font-bold z-[300] shadow-lg text-sm animate-reveal">
          {toast}
        </div>
      )}
    </section>
  );
}
