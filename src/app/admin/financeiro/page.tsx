"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

type PaymentRow = {
  payment: { id: string; amount: string; dueDate: string | null; method: string; status: string };
  patientName: string;
};

export default function FinanceiroPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPayments(Array.isArray(d) ? d : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const paid = payments.filter((p) => p.payment.status === "paid");
  const pending = payments.filter((p) => p.payment.status === "pending");
  const overdue = payments.filter((p) => p.payment.status === "overdue");
  const totalPaid = paid.reduce((s, p) => s + Number(p.payment.amount), 0);
  const totalPending = pending.reduce((s, p) => s + Number(p.payment.amount), 0);
  const totalOverdue = overdue.reduce((s, p) => s + Number(p.payment.amount), 0);
  const statusLabel: Record<string, string> = { pending: "Pendente", paid: "Pago", overdue: "Atrasado", cancelled: "Cancelado", refunded: "Reembolsado" };
  const statusColor: Record<string, string> = { pending: "bg-yellow-100 text-yellow-600", paid: "bg-green-100 text-green-600", overdue: "bg-red-100 text-red-500", cancelled: "bg-gray-100 text-gray-500", refunded: "bg-blue-100 text-blue-500" };
  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-txt">Financeiro</h1>
          <p className="text-sm text-txt-light mt-1">Gerencie pagamentos e receitas</p>
        </div>
        <button className="btn-brand-primary text-sm">+ Novo Pagamento</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Receita do Mês</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Pendente</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Atrasado</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-brand shadow-sm border border-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10 bg-bg">
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Paciente</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Valor</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Vencimento</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Método</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-txt-muted">
                    {loading ? "Carregando..." : "Nenhum pagamento registrado. Adicione pagamentos para acompanhar suas receitas."}
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment.id} className="border-b border-primary/5 hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-txt">{p.patientName}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{formatCurrency(Number(p.payment.amount))}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{p.payment.dueDate || "—"}</td>
                    <td className="px-6 py-4 text-sm text-txt-light capitalize">{p.payment.method}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${statusColor[p.payment.status] || ""}`}>
                        {statusLabel[p.payment.status] || p.payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
