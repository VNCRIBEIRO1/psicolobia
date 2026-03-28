"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { WHATSAPP_LINK } from "@/lib/utils";

type Appointment = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: string;
  status: string;
};

type PaymentRow = {
  payment: { id: string; amount: string; status: string };
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

export default function PortalPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "Paciente";
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/appointments").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/portal/payments").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([apts, pays]) => {
        const aptList = Array.isArray(apts)
          ? apts.map((a: Record<string, unknown>) => (a.appointment ?? a) as Appointment)
          : [];
        setAppointments(aptList);
        setPayments(Array.isArray(pays) ? pays : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments
    .filter((a) => a.status === "pending" || a.status === "confirmed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completed = appointments.filter((a) => a.status === "completed");
  const pendingPay = payments.filter((p) => p.payment.status === "pending" || p.payment.status === "overdue");
  const totalPending = pendingPay.reduce((s, p) => s + Number(p.payment.amount), 0);

  const nextSession = upcoming[0];

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Olá, {firstName} 🌿</h1>
        <p className="text-sm text-txt-light mt-1">Bem-vinda(o) ao seu portal de atendimento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Próxima Sessão</p>
          {nextSession ? (
            <>
              <p className="text-base font-semibold text-txt mt-1">{fmtDate(nextSession.date)}</p>
              <p className="text-xs text-txt-muted">{nextSession.startTime} • {nextSession.modality}</p>
            </>
          ) : (
            <p className="text-sm text-txt-muted mt-1">Nenhuma agendada</p>
          )}
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Sessões Realizadas</p>
          <p className="text-2xl font-bold text-primary-dark mt-1">{loading ? "…" : completed.length}</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Próximas Sessões</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{loading ? "…" : upcoming.length}</p>
        </div>
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <p className="text-xs text-txt-muted font-medium">Pagamentos Pendentes</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {loading ? "…" : `R$ ${totalPending.toFixed(2).replace(".", ",")}`}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Upcoming sessions */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">📅 Próximas Sessões</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-txt-muted text-center py-6">Nenhuma sessão agendada</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((a) => (
                <div key={a.id} className="py-3 border-b border-primary/5 last:border-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-medium text-txt">{fmtDate(a.date)} às {a.startTime}</p>
                      <p className="text-xs text-txt-muted capitalize">{a.modality === "online" ? "📹 Online" : "🏢 Presencial"}</p>
                    </div>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold ${statusColor[a.status] || ""}`}>
                      {statusLabel[a.status] || a.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Link href={`/portal/triagem/${a.id}`} className="text-[0.65rem] text-accent font-bold hover:underline">
                      📋 Triagem
                    </Link>
                    <Link href={`/portal/sala-espera/${a.id}`} className="text-[0.65rem] text-primary-dark font-bold hover:underline">
                      🏠 Sala de Espera
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">🚀 Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/portal/agendar" className="flex items-center gap-3 p-4 rounded-brand-sm border border-primary/10 hover:border-primary/30 hover:bg-bg/50 transition-colors">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-sm font-semibold text-txt">Agendar Sessão</p>
                <p className="text-xs text-txt-muted">Escolha data e horário</p>
              </div>
            </Link>
            <Link href="/portal/sessoes" className="flex items-center gap-3 p-4 rounded-brand-sm border border-primary/10 hover:border-primary/30 hover:bg-bg/50 transition-colors">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-sm font-semibold text-txt">Minhas Sessões</p>
                <p className="text-xs text-txt-muted">Histórico completo</p>
              </div>
            </Link>
            <Link href="/portal/pagamentos" className="flex items-center gap-3 p-4 rounded-brand-sm border border-primary/10 hover:border-primary/30 hover:bg-bg/50 transition-colors">
              <span className="text-2xl">💳</span>
              <div>
                <p className="text-sm font-semibold text-txt">Pagamentos</p>
                <p className="text-xs text-txt-muted">Faturas e recibos</p>
              </div>
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-brand-sm border border-primary/10 hover:border-primary/30 hover:bg-bg/50 transition-colors">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-sm font-semibold text-txt">Falar com a Bea</p>
                <p className="text-xs text-txt-muted">WhatsApp direto</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
