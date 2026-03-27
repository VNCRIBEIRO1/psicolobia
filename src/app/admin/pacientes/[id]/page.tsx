import Link from "next/link";

export default function PacienteDetalhePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/pacientes" className="text-xs text-primary-dark font-bold hover:underline mb-2 inline-block">
          ← Voltar para pacientes
        </Link>
        <h1 className="font-heading text-2xl font-bold text-txt">Detalhes do Paciente</h1>
        <p className="text-sm text-txt-light mt-1">ID: {params.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Patient Info */}
        <div className="lg:col-span-1 bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">📋 Informações</h3>
          <p className="text-sm text-txt-muted text-center py-8">
            Conecte o banco de dados para ver os dados do paciente.
          </p>
        </div>

        {/* Clinical Records */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base font-semibold text-txt">📝 Prontuário</h3>
              <button className="btn-brand-primary text-xs !py-1.5 !px-3">+ Nova Anotação</button>
            </div>
            <p className="text-sm text-txt-muted text-center py-8">Nenhum registro clínico encontrado.</p>
          </div>

          <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <h3 className="font-heading text-base font-semibold text-txt mb-4">📅 Sessões</h3>
            <p className="text-sm text-txt-muted text-center py-8">Nenhuma sessão registrada.</p>
          </div>

          <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <h3 className="font-heading text-base font-semibold text-txt mb-4">💰 Pagamentos</h3>
            <p className="text-sm text-txt-muted text-center py-8">Nenhum pagamento registrado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
