"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";

type DashboardData = {
  stats: { activePatients: number; monthSessions: number; monthRevenue: string };
  upcoming: Array<{ appointment: { id: string; date: string; startTime: string; modality: string }; patientName: string }>;
  pendingPayments: Array<{ payment: { id: string; amount: string; dueDate: string | null }; patientName: string }>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: "👥", label: "Pacientes Ativos", value: data?.stats.activePatients ?? 0, color: "bg-blue-50 text-blue-600" },
    { icon: "📅", label: "Sessões este mês", value: data?.stats.monthSessions ?? 0, color: "bg-green-50 text-green-600" },
    { icon: "💰", label: "Receita do mês", value: formatCurrency(Number(data?.stats.monthRevenue ?? 0)), color: "bg-yellow-50 text-yellow-600" },
    { icon: "📋", label: "Próximas sessões", value: data?.upcoming.length ?? 0, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Dashboard</h1>
        <p className="text-sm text-txt-light mt-1">Visão geral da sua prática clínica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center text-lg mb-3`}>
              {s.icon}
            </div>
            <p className="text-xs text-txt-muted font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-txt mt-1">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">📅 Próximas Sessões</h3>
          {!data?.upcoming.length ? (
            <p className="text-sm text-txt-muted text-center py-8">Nenhuma sessão agendada</p>
          ) : (
            <div className="space-y-3">
              {data.upcoming.map((u) => (
                <div key={u.appointment.id} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-txt">{u.patientName}</p>
                    <p className="text-xs text-txt-muted">{u.appointment.date} às {u.appointment.startTime}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark font-bold">
                    {u.appointment.modality === "online" ? "📹 Online" : "🏢 Presencial"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">💰 Pagamentos Pendentes</h3>
          {!data?.pendingPayments.length ? (
            <p className="text-sm text-txt-muted text-center py-8">Nenhum pagamento pendente</p>
          ) : (
            <div className="space-y-3">
              {data.pendingPayments.map((p) => (
                <div key={p.payment.id} className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-txt">{p.patientName}</p>
                    <p className="text-xs text-txt-muted">Venc.: {p.payment.dueDate || "—"}</p>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">{formatCurrency(Number(p.payment.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
