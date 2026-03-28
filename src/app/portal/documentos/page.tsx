"use client";
import Link from "next/link";

export default function PortalDocumentosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Meus Documentos</h1>
        <p className="text-sm text-txt-light mt-1">Declarações, relatórios e outros documentos</p>
      </div>

      <div className="bg-white rounded-brand p-8 shadow-sm border border-primary/5 text-center">
        <span className="text-4xl block mb-4">📄</span>
        <p className="text-sm text-txt font-semibold mb-2">
          Nenhum documento disponível ainda.
        </p>
        <p className="text-xs text-txt-muted mb-6 max-w-sm mx-auto">
          Documentos emitidos pela profissional — como declarações de comparecimento,
          relatórios e encaminhamentos — aparecerão aqui automaticamente.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="https://wa.me/5511988840525?text=Olá Bea! Preciso solicitar um documento."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand-primary text-sm"
          >
            Solicitar via WhatsApp 💬
          </a>
          <Link href="/portal" className="btn-brand-outline text-sm">
            Voltar ao Início
          </Link>
        </div>
      </div>

      <div className="bg-primary/5 rounded-brand p-5 mt-6">
        <p className="text-sm font-semibold text-txt mb-2">ℹ️ Tipos de documentos disponíveis</p>
        <ul className="text-xs text-txt-light space-y-1.5">
          <li>📋 Declaração de comparecimento</li>
          <li>📊 Relatório de acompanhamento</li>
          <li>🔄 Encaminhamento profissional</li>
          <li>📝 Atestado de acompanhamento psicológico</li>
        </ul>
      </div>
    </div>
  );
}
