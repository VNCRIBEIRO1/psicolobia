"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Appointment = {
  id: string;
  patientId: string;
  patientName?: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: string;
  status: string;
  notes: string | null;
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

  /* Create session */
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
      if (res.ok) { flash("Sessão agendada! ✅"); setShowModal(false); fetchAppointments(); }
      else { const b = await res.json().catch(() => ({})); flash((b as Record<string, string>).error || "Erro ao agendar."); }
    } catch { flash("Erro de conexão."); }
    setSaving(false);
  };

  /* Change status */
  const handleStatus = async (apt: Appointment, s: string) => {
    try {
      const res = await fetch(`/api/appointments/${apt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      if (res.ok) { flash("Status atualizado! ✅"); setShowDetail(null); fetchAppointments(); }
      else flash("Erro ao atualizar status.");
    } catch { flash("Erro de conexão."); }
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
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg font-semibold text-txt">{MONTHS[month]} {year}</h3>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors">‹</button>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors">›</button>
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

        {/* Side Panel */}
        <div className="lg:col-span-1 bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">
            {selectedDate ? `📅 ${formatDate(selectedDate)}` : "📅 Selecione um dia"}
          </h3>
          {loading ? (
            <p className="text-sm text-txt-muted text-center py-8">Carregando…</p>
          ) : !selectedDate ? (
            <p className="text-sm text-txt-muted text-center py-8">Clique em um dia do calendário para ver os agendamentos.</p>
          ) : selectedApts.length === 0 ? (
            <p className="text-sm text-txt-muted text-center py-8">Nenhum agendamento neste dia.</p>
          ) : (
            <div className="space-y-3">
              {selectedApts.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setShowDetail(a)}
                  className="p-3 bg-bg/50 rounded-brand-sm border border-primary/5 cursor-pointer hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-txt">{a.patientName || "Paciente"}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${statusColor[a.status] || ""}`}>
                      {statusLabel[a.status] || a.status}
                    </span>
                  </div>
                  <p className="text-xs text-txt-muted">{a.startTime} – {a.endTime} • {a.modality}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-brand p-8 shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold text-txt">Nova Sessão</h3>
              <button onClick={() => setShowModal(false)} className="text-txt-muted hover:text-txt text-lg">✕</button>
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
                <textarea name="notes" rows={3} className={inputCls} placeholder="Notas sobre a sessão…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-brand-primary flex-1 disabled:opacity-50">
                  {saving ? "Agendando…" : "Agendar Sessão 🌿"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border-[1.5px] border-primary/15 rounded-brand-sm text-sm text-txt hover:bg-bg transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-brand p-8 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-semibold text-txt">Detalhes da Sessão</h3>
              <button onClick={() => setShowDetail(null)} className="text-txt-muted hover:text-txt text-lg">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Paciente</span>
                <span className="text-txt font-medium">{showDetail.patientName || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Data</span>
                <span className="text-txt">{formatDate(showDetail.date)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-primary/5">
                <span className="text-txt-muted">Horário</span>
                <span className="text-txt">{showDetail.startTime} – {showDetail.endTime}</span>
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

            {/* Edit Form */}
            <div className="mt-6 pt-4 border-t border-primary/10">
              <h4 className="text-xs font-bold text-txt-muted mb-3">Editar Sessão</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold mb-1">Data</label>
                    <input
                      type="date"
                      defaultValue={showDetail.date}
                      id="edit-date"
                      className={inputCls}
                    />
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
                    <label className="block text-xs font-bold mb-1">Início</label>
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
                      if (res.ok) { flash("Sessão atualizada! ✅"); setShowDetail(null); fetchAppointments(); }
                      else flash("Erro ao atualizar sessão.");
                    } catch { flash("Erro de conexão."); }
                  }}
                  className="btn-brand-primary text-xs w-full"
                >
                  Salvar Alterações 🌿
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-primary/10">
              {showDetail.status === "pending" && (
                <>
                  <button onClick={() => handleStatus(showDetail, "confirmed")} className="btn-brand-primary text-xs !py-1.5 !px-3">Confirmar</button>
                  <button onClick={() => handleStatus(showDetail, "cancelled")} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-brand-sm hover:bg-red-50 transition-colors">Cancelar</button>
                </>
              )}
              {showDetail.status === "confirmed" && (
                <>
                  <button onClick={() => handleStatus(showDetail, "completed")} className="btn-brand-primary text-xs !py-1.5 !px-3">Concluída</button>
                  <button onClick={() => handleStatus(showDetail, "no_show")} className="text-xs px-3 py-1.5 border border-gray-200 text-gray-500 rounded-brand-sm hover:bg-gray-50 transition-colors">Não Compareceu</button>
                  <button onClick={() => handleStatus(showDetail, "cancelled")} className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-brand-sm hover:bg-red-50 transition-colors">Cancelar</button>
                </>
              )}
              <button onClick={() => setShowDetail(null)} className="text-xs px-3 py-1.5 border border-primary/15 text-txt-muted rounded-brand-sm hover:bg-bg transition-colors ml-auto">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
