"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Payment {
  id: string;
  amount: string;
  status: string;
  method: string | null;
  dueDate: string | null;
  paidAt: string | null;
  description: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-purple-100 text-purple-700",
};
const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};
const methodLabels: Record<string, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  bank_transfer: "Transferência",
  cash: "Dinheiro",
};

export default function PortalPagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/portal/payments")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        // API returns [{payment: {...}, patientName: "..."}] — unwrap
        const list = Array.isArray(data)
          ? data.map((row: Record<string, unknown>) => (row.payment ?? row) as Payment)
          : [];
        setPayments(list);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const totalPending = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

  const fmtCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  const generateFakePayLink = (id: string, amount: string) => {
    const link = `https://psicolobia.vercel.app/pagamento/${id}?valor=${amount}&ref=${Date.now()}`;
    navigator.clipboard.writeText(link);
    alert(`Link de pagamento copiado!\n${link}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-txt">Meus Pagamentos</h1>
          <p className="text-sm text-txt-light mt-1">Histórico de pagamentos e pendências</p>
        </div>
        <Link href="/portal/agendar" className="btn-brand-primary text-sm">
          + Agendar Sessão
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Total Pago</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{fmtCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Pendente</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{fmtCurrency(totalPending)}</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Total de Pagamentos</p>
          <p className="text-2xl font-bold text-txt mt-1">{payments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "Todos" },
          { key: "pending", label: "Pendentes" },
          { key: "paid", label: "Pagos" },
          { key: "overdue", label: "Atrasados" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              filter === key ? "bg-primary text-white" : "bg-white border border-primary/15 text-txt-light hover:bg-bg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-brand shadow-sm border border-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10 bg-bg">
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Vencimento</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Valor</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Método</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-txt-muted">Carregando…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-txt-muted">
                    {filter === "all" ? "Nenhum pagamento encontrado." : `Nenhum pagamento ${statusLabels[filter]?.toLowerCase() || ""}.`}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-primary/5 hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-txt">{fmtDate(p.dueDate || p.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-txt">
                      {fmtCurrency(parseFloat(p.amount || "0"))}
                    </td>
                    <td className="px-6 py-4 text-sm text-txt-light">
                      {p.method ? methodLabels[p.method] || p.method : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[p.status] || "bg-gray-100 text-gray-500"}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(p.status === "pending" || p.status === "overdue") && (
                        <button
                          onClick={() => generateFakePayLink(p.id, p.amount)}
                          className="text-xs text-primary-dark font-bold hover:underline"
                        >
                          💳 Gerar Link
                        </button>
                      )}
                      {p.status === "paid" && p.paidAt && (
                        <span className="text-xs text-green-600">Pago em {fmtDate(p.paidAt)}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIX info */}
      <div className="bg-green-50 border border-green-200 rounded-brand p-5 mt-6">
        <p className="text-sm font-semibold text-green-800 mb-1">🔑 Pagamento via PIX</p>
        <p className="text-sm text-green-700">Chave: <span className="font-mono">psicolobia@email.com</span></p>
        <p className="text-xs text-green-600 mt-1">Envie o comprovante pelo WhatsApp para confirmação rápida.</p>
      </div>
    </div>
  );
}
