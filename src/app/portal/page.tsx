"use client";
import { useSession } from "next-auth/react";
import { WHATSAPP_LINK } from "@/lib/utils";

export default function PortalPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Paciente";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Olá, {firstName} 🌿</h1>
        <p className="text-sm text-txt-light mt-1">Bem-vinda(o) ao seu portal de atendimento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Próxima Sessão</p>
          <p className="text-base font-semibold text-txt mt-1">Nenhuma agendada</p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="text-xs text-primary-dark font-bold mt-3 inline-block hover:underline">
            Agendar via WhatsApp →
          </a>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Sessões Realizadas</p>
          <p className="text-2xl font-bold text-primary-dark mt-1">0</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Pagamentos Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">R$ 0,00</p>
        </div>
      </div>

      <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
        <h3 className="font-heading text-base font-semibold text-txt mb-4">Histórico de Sessões</h3>
        <p className="text-sm text-txt-muted text-center py-8">
          Você ainda não possui sessões registradas.<br />
          Entre em contato para agendar sua primeira sessão.
        </p>
        <div className="text-center">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="btn-brand-primary inline-block text-sm">
            Falar com a Bea 💬
          </a>
        </div>
      </div>
    </div>
  );
}
