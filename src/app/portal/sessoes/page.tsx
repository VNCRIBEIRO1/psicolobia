"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: string;
  status: string;
  notes: string | null;
  meetingUrl: string | null;
};

const statusLabel: Record<string, string> = {
  pending: "Pendente", confirmed: "Confirmada", cancelled: "Cancelada",
  completed: "Realizada", no_show: "Não compareceu",
};
const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-600", confirmed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-500", completed: "bg-blue-100 text-blue-600",
  no_show: "bg-gray-100 text-gray-500",
};

export default function PortalSessoesPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/portal/appointments")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data)
          ? data.map((a: Record<string, unknown>) => (a.appointment ?? a) as Appointment)
          : [];
        setAppointments(list);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? appointments
    : appointments.filter((a) => a.status === filter);

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-txt">Minhas Sessões</h1>
          <p className="text-sm text-txt-light mt-1">Histórico e próximas sessões agendadas</p>
        </div>
        <Link href="/portal/agendar" className="btn-brand-primary text-sm">
          📅 Agendar Nova Sessão
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "Todas" },
          { key: "pending", label: "Pendentes" },
          { key: "confirmed", label: "Confirmadas" },
          { key: "completed", label: "Realizadas" },
          { key: "cancelled", label: "Canceladas" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-white border border-primary/15 text-txt-light hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-brand shadow-sm border border-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10 bg-bg">
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Data</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Horário</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Modalidade</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Ação</th>
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
                    {filter === "all"
                      ? "Nenhuma sessão encontrada. Agende sua primeira sessão!"
                      : "Nenhuma sessão com este status."}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-primary/5 hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-txt">{fmtDate(a.date)}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{a.startTime} – {a.endTime}</td>
                    <td className="px-6 py-4 text-sm text-txt-light capitalize">{a.modality === "online" ? "📹 Online" : "🏢 Presencial"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${statusColor[a.status] || ""}`}>
                        {statusLabel[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(a.status === "confirmed" && a.modality === "online") && (
                        <Link href={a.meetingUrl || "/#sala-espera"} target={a.meetingUrl ? "_blank" : undefined}
                          className="text-xs text-primary-dark font-bold hover:underline">
                          Entrar na Sala →
                        </Link>
                      )}
                      {a.status === "pending" && (
                        <span className="text-xs text-yellow-600">Aguardando confirmação</span>
                      )}
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
