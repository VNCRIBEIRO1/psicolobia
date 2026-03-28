"use client";
import { useState, useEffect } from "react";
import { formatDate, buildWhatsAppUrl } from "@/lib/utils";
import { buildMeetingUrl } from "@/lib/jitsi";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Appointment = {
  id: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: string;
  status: string;
  notes: string | null;
  meetingUrl: string | null;
};

type PatientOption = { id: string; name: string };

const statusLabel: Record<string, string> = {
  pending: "Pendente", confirmed: "Confirmada", cancelled: "Cancelada",
  completed: "Realizada", no_show: "Não compareceu",
};
const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-600", confirmed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-500", completed: "bg-blue-100 text-blue-600",
  no_show: "bg-gray-100 text-gray-500",
};
const dotColor: Record<string, string> = {
  pending: "bg-yellow-400", confirmed: "bg-green-400",
  cancelled: "bg-red-400", completed: "bg-blue-400",
  no_show: "bg-gray-400",
};

const inputCls =
  "w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

function buildReminderMessage(apt: Appointment): string {
  const dateBR = new Date(apt.date + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const modalityText = apt.modality === "presencial" ? "Presencial" : "Online (videochamada)";
  let msg = `🌿 *Lembrete de Sessão — Psicolobia*\n\n` +
    `Olá, ${apt.patientName || ""}! 😊\n\n` +
    `Passando para lembrar da sua sessão:\n\n` +
    `📅 *Data:* ${dateBR}\n` +
    `⏰ *Horário:* ${apt.startTime} às ${apt.endTime}\n` +
    `📍 *Modalidade:* ${modalityText}\n`;

  if (apt.modality === "online" && apt.meetingUrl) {
    msg += `\n🔗 *Link da videochamada:*\n${apt.meetingUrl}\n`;
  }

  msg += `\nCaso precise remarcar, me avise com antecedência. ` +
    `Te espero! 🌿\n\n— Bea | Psicolobia`;
  return msg;
}

export default function AgendaPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Appointment | null>(null);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(
          Array.isArray(data)
            ? data.map((a: Record<string, unknown>) => ({
                ...(a.appointment ?? a),
                patientName: a.patientName,
                patientPhone: a.patientPhone,
              }) as Appointment)
            : []
        );
      }
    } catch { /* network */ }
    setLoading(false);
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        const d = await res.json();
        setPatients(Array.isArray(d) ? d.map((p: Record<string, unknown>) => ({ id: p.id as string, name: p.name as string })) : []);
      }
    } catch { /* network */ }
  };

  useEffect(() => { fetchAppointments(); fetchPatients(); }, []);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const changeMonth = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmtDate = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`;
  const getApts = (d: number) => appointments.filter((a) => a.date === fmtDate(d));

  const selectedApts = selectedDate ? appointments.filter((a) => a.date === selectedDate) : [];

  const sendReminder = (apt: Appointment) => {
    if (!apt.patientPhone) {
      flash("Paciente sem telefone cadastrado.");
      return;
    }
    const msg = buildReminderMessage(apt);
    const url = buildWhatsAppUrl(apt.patientPhone, msg);
    window.open(url, "_blank");
    flash("WhatsApp aberto com lembrete!");
  };

  const sendBulkReminders = () => {
    const toRemind = selectedApts.filter(
      (a) => (a.status === "confirmed" || a.status === "pending") && a.patientPhone
    );
    if (toRemind.length === 0) {
      flash("Nenhuma sessão com telefone para lembrar.");
      return;
    }
    toRemind.forEach((apt, idx) => {
      setTimeout(() => {
        sendReminder(apt);
      }, idx * 800);
    });
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: fd.get("patientId"),
          date: fd.get("date"),
          startTime: fd.get("startTime"),
          endTime: fd.get("endTime"),
          modality: fd.get("modality"),
          notes: fd.get("notes"),
        }),
      });
      if (res.ok) { flash("Sessão agendada!"); setShowModal(false); fetchAppointments(); }
      else { const b = await res.json().catch(() => ({})); flash((b as Record<string, string>).error || "Erro ao agendar."); }
    } catch { flash("Erro de conexão."); }
    setSaving(false);
  };

  const handleStatus = async (apt: Appointment, s: string) => {
    try {
      const res = await fetch(`/api/appointments/${apt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (res.ok) {
        flash(`Status -> ${statusLabel[s] || s}`);
        const updated = await res.json();
        setShowDetail((prev) => prev ? { ...prev, status: s, ...(updated.meetingUrl ? { meetingUrl: updated.meetingUrl } : {}) } : null);
        fetchAppointments();
      }
      else flash("Erro ao atualizar status.");
    } catch { flash("Erro de conexão."); }
  };

  const statusActions = (apt: Appointment) => {
    const btns: React.ReactNode[] = [];
    const btnCls = (color: string) =>
      `text-xs px-3 py-1.5 border rounded-brand-sm font-bold transition-colors ${color}`;

    if (apt.status === "pending") {
      btns.push(
        <button key="confirm" onClick={() => handleStatus(apt, "confirmed")}
          className={btnCls("border-green-200 text-green-700 bg-green-50 hover:bg-green-100")}>
          Confirmar
        </button>,
        <button key="cancel" onClick={() => handleStatus(apt, "cancelled")}
          className={btnCls("border-red-200 text-red-500 hover:bg-red-50")}>
          Cancelar
        </button>,
      );
    }
    if (apt.status === "confirmed") {
      btns.push(
        <button key="complete" onClick={() => handleStatus(apt, "completed")}
          className={btnCls("border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100")}>
          Realizada
        </button>,
        <button key="noshow" onClick={() => handleStatus(apt, "no_show")}
          className={btnCls("border-gray-200 text-gray-500 hover:bg-gray-100")}>
          Não Compareceu
        </button>,
        <button key="cancel2" onClick={() => handleStatus(apt, "cancelled")}
          className={btnCls("border-red-200 text-red-500 hover:bg-red-50")}>
          Cancelar
        </button>,
      );
    }
    if (apt.status === "cancelled" || apt.status === "no_show") {
      btns.push(
        <button key="reopen" onClick={() => handleStatus(apt, "pending")}
          className={btnCls("border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100")}>
          Reabrir
        </button>,
      );
    }
    if (apt.status === "completed") {
      btns.push(
        <span key="done" className="text-xs text-blue-600 font-medium">Sessão concluída</span>,
      );
    }
    return btns;
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-primary/20 text-txt text-sm px-5 py-3 rounded-brand-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-txt">Agenda</h1>
          <p className="text-sm text-txt-light mt-1">Gerencie seus agendamentos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-brand-primary text-sm">+ Nova Sessão</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold text-txt">{MONTHS[month]} {year}</h3>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors">&lsaquo;</button>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors">&rsaquo;</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-txt-muted py-2">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const dt = new Date(year, month, d);
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
              const dateStr = fmtDate(d);
              const dayApts = getApts(d);
              const isSel = selectedDate === dateStr;

              return (
                <div
                  key={d}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[80px] p-2 rounded-brand-sm border transition-colors cursor-pointer
                    ${isSel ? "border-primary bg-primary/10" : isToday ? "border-primary bg-primary/5" : "border-primary/5"}
                    ${isWeekend ? "bg-gray-50/50" : "hover:bg-bg/50"}`}
                >
                  <span className={`text-xs font-semibold ${isToday ? "text-primary-dark" : "text-txt-light"}`}>{d}</span>
                  {dayApts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayApts.slice(0, 3).map((a) => (
                        <span key={a.id} className={`w-2 h-2 rounded-full ${dotColor[a.status] || "bg-gray-300"}`} />
                      ))}
                      {dayApts.length > 3 && <span className="text-[0.6rem] text-txt-muted">+{dayApts.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-semibold text-txt">
              {selectedDate ? `📅 ${formatDate(selectedDate)}` : "📅 Selecione um dia"}
            </h3>
            {selectedDate && selectedApts.filter((a) => a.status === "confirmed" || a.status === "pending").length > 0 && (
              <button
                onClick={sendBulkReminders}
                className="text-[0.65rem] px-2 py-1 bg-[#25D366] text-white rounded-brand-sm font-bold hover:bg-[#1da855] transition-colors flex items-center gap-1"
                title="Enviar lembrete WhatsApp para todas sessões do dia"
              >
                📱 Lembrar Todos
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-sm text-txt-muted text-center py-8">Carregando...</p>
          ) : !selectedDate ? (
            <p className="text-sm text-txt-muted text-center py-8">Clique em um dia do calendário para ver os agendamentos.</p>
          ) : selectedApts.length === 0 ? (
            <p className="text-sm text-txt-muted text-center py-8">Nenhum agendamento neste dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedApts.map((a) => (
                <div
                  key={a.id}
                  className="p-3 bg-bg/50 rounded-brand-sm border border-primary/5 hover:border-primary/20 transition-colors"
                >
                  <div onClick={() => setShowDetail(a)} className="cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-txt">{a.patientName || "Paciente"}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${statusColor[a.status] || ""}`}>
                        {statusLabel[a.status] || a.status}
                      </span>
                    </div>
                    <p className="text-xs text-txt-muted">{a.startTime} - {a.endTime} | {a.modality}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-primary/5">
                    {(a.status === "confirmed" || a.status === "pending") && a.patientPhone && (
                      <button
                        onClick={() => sendReminder(a)}
                        className="text-[0.6rem] px-2 py-1 bg-[#25D366] text-white rounded-brand-sm font-bold hover:bg-[#1da855] transition-colors"
                        title="Enviar lembrete via WhatsApp"
                      >
                        \ud83d\udcf1 Lembrete
                      </button>
                    )}
                    {a.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatus(a, "confirmed")}
                          className="text-[0.6rem] px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-brand-sm font-bold hover:bg-green-100 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleStatus(a, "cancelled")}
                          className="text-[0.6rem] px-2 py-1 bg-red-50 text-red-500 border border-red-200 rounded-brand-sm font-bold hover:bg-red-100 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {a.status === "confirmed" && (
                      <button
                        onClick={() => handleStatus(a, "completed")}
                        className="text-[0.6rem] px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-brand-sm font-bold hover:bg-blue-100 transition-colors"
                      >
                        Concluída
                      </button>
                    )}
                    <button
                      onClick={() => setShowDetail(a)}
                      className="text-[0.6rem] px-2 py-1 text-txt-muted border border-primary/10 rounded-brand-sm hover:bg-bg transition-colors ml-auto"
                    >
                      Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-brand p-8 shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold text-txt">Nova Sessão</h3>
              <button onClick={() => setShowModal(false)} className="text-txt-muted hover:text-txt text-lg">X</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5">Paciente *</label>
                <select name="patientId" required className={inputCls}>
                  <option value="">Selecione o paciente</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">Data *</label>
                <input name="date" type="date" required defaultValue={selectedDate ?? ""} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5">Início *</label>
                  <input name="startTime" type="time" required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">Fim *</label>
                  <input name="endTime" type="time" required className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">Modalidade</label>
                <select name="modality" className={inputCls}>
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5">Observações</label>
                <textarea name="notes" rows={3} className={inputCls} placeholder="Notas sobre a sessão..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-brand-primary flex-1 disabled:opacity-50">
                  {saving ? "Agendando..." : "Agendar Sessão"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border-[1.5px] border-primary/15 rounded-brand-sm text-sm text-txt hover:bg-bg transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-brand p-8 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold text-txt">Detalhes da Sessão</h3>
              <button onClick={() => setShowDetail(null)} className="text-txt-muted hover:text-txt text-lg">X</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Paciente</span>
                <span className="text-txt font-medium">{showDetail.patientName || "--"}</span>
              </div>
              {showDetail.patientPhone && (
                <div className="flex justify-between py-1.5 border-b border-primary/5">
                  <span className="text-txt-muted">Telefone</span>
                  <span className="text-txt">{showDetail.patientPhone}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Data</span>
                <span className="text-txt">{formatDate(showDetail.date)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Horário</span>
                <span className="text-txt">{showDetail.startTime} - {showDetail.endTime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Modalidade</span>
                <span className="text-txt capitalize">{showDetail.modality}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Status</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${statusColor[showDetail.status] || ""}`}>
                  {statusLabel[showDetail.status] || showDetail.status}
                </span>
              </div>
              {showDetail.notes && (
                <div className="py-1.5">
                  <span className="text-txt-muted text-xs">Notas:</span>
                  <p className="text-txt mt-1">{showDetail.notes}</p>
                </div>
              )}
            </div>

            {showDetail.patientPhone && (showDetail.status === "confirmed" || showDetail.status === "pending") && (
              <div className="mt-4 pt-4 border-t border-primary/10">
                <button
                  onClick={() => sendReminder(showDetail)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-sm font-bold rounded-brand-sm hover:bg-[#1da855] transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  Enviar Lembrete via WhatsApp
                </button>
              </div>
            )}

            {showDetail.modality === "online" && (
              <div className="mt-4 pt-4 border-t border-primary/10">
                <h4 className="text-xs font-bold text-txt-muted mb-3">Link da Videochamada</h4>
                {showDetail.meetingUrl ? (
                  <div className="bg-green-50 border border-green-200 rounded-brand-sm p-3">
                    <p className="text-xs text-green-800 font-mono break-all mb-2">{showDetail.meetingUrl}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(showDetail.meetingUrl!);
                          flash("Link copiado!");
                        }}
                        className="text-xs text-green-700 font-bold hover:underline"
                      >
                        Copiar link
                      </button>
                      <a
                        href={showDetail.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-700 font-bold hover:underline"
                      >
                        Abrir sala
                      </a>
                      {showDetail.patientPhone && (
                        <button
                          onClick={() => {
                            const msg = `Link da sua sessão — Psicolobia\n\nOlá, ${showDetail.patientName}! Aqui está o link da sua videochamada:\n\n${showDetail.meetingUrl}\n\nTe espero! 🌿`;
                            const url = buildWhatsAppUrl(showDetail.patientPhone!, msg);
                            window.open(url, "_blank");
                          }}
                          className="text-xs text-[#25D366] font-bold hover:underline"
                        >
                          Enviar via WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-brand-sm p-3">
                    <p className="text-xs text-yellow-700 mb-2">Nenhum link gerado. Gere para enviar ao paciente.</p>
                    <button
                      onClick={async () => {
                        const url = buildMeetingUrl(showDetail.id);
                        try {
                          const res = await fetch(`/api/appointments/${showDetail.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ meetingUrl: url }),
                          });
                          if (res.ok) {
                            setShowDetail({ ...showDetail, meetingUrl: url });
                            navigator.clipboard.writeText(url);
                            flash("Link gerado e copiado!");
                            fetchAppointments();
                          } else flash("Erro ao gerar link.");
                        } catch { flash("Erro de conexão."); }
                      }}
                      className="btn-brand-primary text-xs !py-1.5 !px-3"
                    >
                      Gerar Link de Videochamada
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-primary/10">
              <h4 className="text-xs font-bold text-txt-muted mb-3">Editar Sessão</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">Data</label>
                    <input type="date" defaultValue={showDetail.date} id="edit-date" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Modalidade</label>
                    <select defaultValue={showDetail.modality} id="edit-modality" className={inputCls}>
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">Inicio</label>
                    <input type="time" defaultValue={showDetail.startTime} id="edit-startTime" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Fim</label>
                    <input type="time" defaultValue={showDetail.endTime} id="edit-endTime" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Notas</label>
                  <textarea defaultValue={showDetail.notes || ""} id="edit-notes" rows={2} className={inputCls} />
                </div>
                <button
                  onClick={async () => {
                    const date = (document.getElementById("edit-date") as HTMLInputElement).value;
                    const startTime = (document.getElementById("edit-startTime") as HTMLInputElement).value;
                    const endTime = (document.getElementById("edit-endTime") as HTMLInputElement).value;
                    const modalityVal = (document.getElementById("edit-modality") as HTMLSelectElement).value;
                    const notesVal = (document.getElementById("edit-notes") as HTMLTextAreaElement).value;
                    try {
                      const res = await fetch(`/api/appointments/${showDetail.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date, startTime, endTime, modality: modalityVal, notes: notesVal }),
                      });
                      if (res.ok) { flash("Sessão atualizada!"); setShowDetail(null); fetchAppointments(); }
                      else flash("Erro ao atualizar sessão.");
                    } catch { flash("Erro de conexão."); }
                  }}
                  className="btn-brand-primary text-xs w-full"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-primary/10">
              {statusActions(showDetail)}
              <button onClick={() => setShowDetail(null)} className="text-xs px-3 py-1.5 border border-primary/15 text-txt-muted rounded-brand-sm hover:bg-bg transition-colors ml-auto">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
