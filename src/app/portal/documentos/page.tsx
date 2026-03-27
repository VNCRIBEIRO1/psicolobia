"use client";

export default function PortalDocumentosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Meus Documentos</h1>
        <p className="text-sm text-txt-light mt-1">Declarações, relatórios e outros documentos</p>
      </div>

      <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
        <p className="text-sm text-txt-muted text-center py-12">
          Nenhum documento disponível.<br />
          Documentos emitidos pela profissional aparecerão aqui.
        </p>
      </div>
    </div>
  );
}
