"use client";

export default function PortalPagamentosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Meus Pagamentos</h1>
        <p className="text-sm text-txt-light mt-1">Histórico de pagamentos e pendências</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Total Pago</p>
          <p className="text-2xl font-bold text-green-600 mt-1">R$ 0,00</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Pendente</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">R$ 0,00</p>
        </div>
      </div>

      <div className="bg-white rounded-brand shadow-sm border border-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10 bg-bg">
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Data</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Descrição</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Valor</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-12 text-sm text-txt-muted">
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
