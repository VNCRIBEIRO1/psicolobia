"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

type Patient = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpf: string | null;
  birthDate: string | null;
  gender: string | null;
  address: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
};

type ClinicalRecord = {
  id: string;
  sessionDate: string;
  sessionNumber: number | null;
  chiefComplaint: string | null;
  clinicalNotes: string | null;
  interventions: string | null;
  homework: string | null;
  mood: string | null;
  createdAt: string;
};

type AppointmentRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: string;
  status: string;
  notes: string | null;
};

type PaymentRow = {
  id: string;
  amount: string;
  method: string | null;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
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
const payStatusLabel: Record<string, string> = {
  pending: "Pendente", paid: "Pago", overdue: "Atrasado",
  cancelled: "Cancelado", refunded: "Reembolsado",
};
const payStatusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-600", paid: "bg-green-100 text-green-600",
  overdue: "bg-red-100 text-red-500", cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-blue-100 text-blue-500",
};

const inputCls =
  "w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-primary/5 last:border-0">
      <span className="text-txt-muted text-xs font-medium">{label}</span>
      <span className="text-txt text-xs text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}

export default function PacienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [appts, setAppts] = useState<AppointmentRow[]>([]);
  const [pays, setPays] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Patient>>({});
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [showNewSession, setShowNewSession] = useState(false);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, rRes, aRes, pmRes] = await Promise.all([
        fetch(`/api/patients/${id}`),
        fetch(`/api/clinical-records?patientId=${id}`),
        fetch(`/api/appointments?patientId=${id}`),
        fetch(`/api/payments?patientId=${id}`),
      ]);
      if (pRes.ok) { const p = await pRes.json(); setPatient(p); setEditData(p); }
      if (rRes.ok) { const r = await rRes.json(); setRecords(Array.isArray(r) ? r : []); }
      if (aRes.ok) {
        const d = await aRes.json();
        setAppts(Array.isArray(d) ? d.map((x: Record<string, unknown>) => (x.appointment ?? x) as AppointmentRow) : []);
      }
      if (pmRes.ok) {
        const d = await pmRes.json();
        setPays(Array.isArray(d) ? d.map((x: Record<string, unknown>) => (x.payment ?? x) as PaymentRow) : []);
      }
    } catch { /* network error */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  /* ---- Save patient edit ---- */
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const u = await res.json();
        setPatient(u);
        setEditing(false);
        flash("Dados atualizados com sucesso! ✅");
      } else flash("Erro ao salvar alterações.");
    } catch { flash("Erro de conexão."); }
    setSaving(false);
  };

  /* ---- New clinical record ---- */
  const handleNewRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/clinical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          sessionDate: fd.get("sessionDate"),
          chiefComplaint: fd.get("chiefComplaint"),
          clinicalNotes: fd.get("clinicalNotes"),
          interventions: fd.get("interventions"),
          homework: fd.get("homework"),
          mood: fd.get("mood"),
          nextSessionPlan: fd.get("nextSessionPlan"),
        }),
      });
      if (res.ok) { flash("Registro clínico criado! ✅"); setShowNewRecord(false); fetchAll(); }
      else flash("Erro ao criar registro.");
    } catch { flash("Erro de conexão."); }
    setSaving(false);
  };

  /* ---- New session ---- */
  const handleNewSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          date: fd.get("date"),
          startTime: fd.get("startTime"),
          endTime: fd.get("endTime"),
          modality: fd.get("modality"),
          notes: fd.get("notes"),
        }),
      });
      if (res.ok) { flash("Sessão agendada com sucesso! ✅"); setShowNewSession(false); fetchAll(); }
      else flash("Erro ao agendar sessão.");
    } catch { flash("Erro de conexão."); }
    setSaving(false);
  };

  /* ---- Render ---- */
  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-sm text-txt-muted">Carregando dados do paciente…</p></div>;
  }
  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-txt-muted mb-4">Paciente não encontrado.</p>
        <Link href="/admin/pacientes" className="text-primary-dark text-sm font-bold hover:underline">← Voltar</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-primary/20 text-txt text-sm px-5 py-3 rounded-brand-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <Link href="/admin/pacientes" className="text-xs text-primary-dark font-bold hover:underline mb-2 inline-block">
          ← Voltar para pacientes
        </Link>
        <h1 className="font-heading text-2xl font-bold text-txt">Detalhes do Paciente</h1>
        <p className="text-sm text-txt-light mt-1">{patient.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ---- Patient Info Card ---- */}
        <div className="lg:col-span-1 bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-semibold text-txt">📋 Informações</h3>
            <button
              onClick={() => { setEditing(!editing); setEditData(patient); }}
              className="text-xs text-primary-dark font-bold hover:underline"
            >
              {editing ? "Cancelar" : "Editar"}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              {([
                ["Nome", "name", "text"],
                ["E-mail", "email", "email"],
                ["Telefone", "phone", "text"],
                ["CPF", "cpf", "text"],
                ["Data de Nascimento", "birthDate", "date"],
                ["Endereço", "address", "text"],
                ["Contato de Emergência", "emergencyContact", "text"],
                ["Tel. Emergência", "emergencyPhone", "text"],
              ] as const).map(([lbl, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-bold mb-1">{lbl}</label>
                  <input
                    type={type}
                    value={(editData[key] as string) ?? ""}
                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                    className={inputCls}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold mb-1">Gênero</label>
                <select value={editData.gender ?? ""} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} className={inputCls}>
                  <option value="">Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="nao-binario">Não-binário</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Observações</label>
                <textarea value={editData.notes ?? ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={3} className={inputCls} />
              </div>
              <button onClick={handleSaveEdit} disabled={saving} className="btn-brand-primary text-sm w-full disabled:opacity-50">
                {saving ? "Salvando…" : "Salvar Alterações 🌿"}
              </button>
            </div>
          ) : (
            <div className="space-y-0 text-sm">
              <InfoRow label="E-mail" value={patient.email} />
              <InfoRow label="Telefone" value={patient.phone} />
              <InfoRow label="CPF" value={patient.cpf} />
              <InfoRow label="Nascimento" value={patient.birthDate ? formatDate(patient.birthDate) : null} />
              <InfoRow label="Gênero" value={patient.gender} />
              <InfoRow label="Endereço" value={patient.address} />
              <InfoRow label="Emergência" value={patient.emergencyContact} />
              <InfoRow label="Tel. Emergência" value={patient.emergencyPhone} />
              <InfoRow label="Observações" value={patient.notes} />
              <InfoRow label="Cadastro" value={formatDate(patient.createdAt)} />
              <div className="pt-3">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${patient.active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                  {patient.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ---- Right Column ---- */}
        <div className="lg:col-span-2 space-y-5">
          {/* Clinical Records */}
          <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base font-semibold text-txt">📝 Prontuário</h3>
              <button onClick={() => setShowNewRecord(!showNewRecord)} className="btn-brand-primary text-xs !py-1.5 !px-3">
                {showNewRecord ? "Cancelar" : "+ Nova Anotação"}
              </button>
            </div>

            {showNewRecord && (
              <form onSubmit={handleNewRecord} className="mb-6 p-4 bg-bg rounded-brand-sm space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Data da Sessão *</label>
                    <input name="sessionDate" type="datetime-local" required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Humor</label>
                    <select name="mood" className={inputCls}>
                      <option value="">Selecione</option>
                      <option value="muito_bem">Muito bem</option>
                      <option value="bem">Bem</option>
                      <option value="neutro">Neutro</option>
                      <option value="mal">Mal</option>
                      <option value="muito_mal">Muito mal</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Queixa Principal</label>
                  <input name="chiefComplaint" type="text" className={inputCls} placeholder="Motivo principal da sessão" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Notas Clínicas *</label>
                  <textarea name="clinicalNotes" required rows={4} className={inputCls} placeholder="Observações da sessão…" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Intervenções</label>
                  <textarea name="interventions" rows={2} className={inputCls} placeholder="Técnicas e intervenções utilizadas…" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Tarefa de Casa</label>
                    <input name="homework" type="text" className={inputCls} placeholder="Atividades para o paciente" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Plano Próxima Sessão</label>
                    <input name="nextSessionPlan" type="text" className={inputCls} placeholder="Planejamento" />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-brand-primary text-sm disabled:opacity-50">
                  {saving ? "Salvando…" : "Salvar Registro 🌿"}
                </button>
              </form>
            )}

            {records.length === 0 ? (
              <p className="text-sm text-txt-muted text-center py-8">Nenhum registro clínico encontrado.</p>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <div key={r.id} className="p-4 bg-bg/50 rounded-brand-sm border border-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-txt-muted">
                        {formatDate(r.sessionDate)} {r.sessionNumber ? `• Sessão #${r.sessionNumber}` : ""}
                      </span>
                      {r.mood && <span className="text-xs bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">{r.mood}</span>}
                    </div>
                    {r.chiefComplaint && <p className="text-sm font-medium text-txt mb-1">{r.chiefComplaint}</p>}
                    {r.clinicalNotes && <p className="text-sm text-txt-light">{r.clinicalNotes}</p>}
                    {r.interventions && <p className="text-xs text-txt-muted mt-2"><strong>Intervenções:</strong> {r.interventions}</p>}
                    {r.homework && <p className="text-xs text-txt-muted"><strong>Tarefa:</strong> {r.homework}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions */}
          <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base font-semibold text-txt">📅 Sessões</h3>
              <button onClick={() => setShowNewSession(!showNewSession)} className="btn-brand-primary text-xs !py-1.5 !px-3">
                {showNewSession ? "Cancelar" : "+ Nova Sessão"}
              </button>
            </div>

            {showNewSession && (
              <form onSubmit={handleNewSession} className="mb-6 p-4 bg-bg rounded-brand-sm space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Data *</label>
                    <input name="date" type="date" required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Início *</label>
                    <input name="startTime" type="time" required className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Fim *</label>
                    <input name="endTime" type="time" required className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Modalidade</label>
                  <select name="modality" className={inputCls}>
                    <option value="online">Online</option>
                    <option value="presencial">Presencial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Observações</label>
                  <input name="notes" type="text" className={inputCls} placeholder="Notas sobre a sessão" />
                </div>
                <button type="submit" disabled={saving} className="btn-brand-primary text-sm disabled:opacity-50">
                  {saving ? "Agendando…" : "Agendar Sessão 🌿"}
                </button>
              </form>
            )}

            {appts.length === 0 ? (
              <p className="text-sm text-txt-muted text-center py-8">Nenhuma sessão registrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/10">
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Data</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Horário</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Modalidade</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appts.map((a) => (
                      <tr key={a.id} className="border-b border-primary/5">
                        <td className="px-3 py-2.5 text-sm text-txt">{formatDate(a.date)}</td>
                        <td className="px-3 py-2.5 text-sm text-txt-light">{a.startTime} – {a.endTime}</td>
                        <td className="px-3 py-2.5 text-sm text-txt-light capitalize">{a.modality}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${statusColor[a.status] || ""}`}>
                            {statusLabel[a.status] || a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <h3 className="font-heading text-base font-semibold text-txt mb-4">💰 Pagamentos</h3>
            {pays.length === 0 ? (
              <p className="text-sm text-txt-muted text-center py-8">Nenhum pagamento registrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/10">
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Valor</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Vencimento</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Método</th>
                      <th className="text-left px-3 py-2 text-xs font-bold text-txt-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pays.map((p) => (
                      <tr key={p.id} className="border-b border-primary/5">
                        <td className="px-3 py-2.5 text-sm text-txt">{formatCurrency(Number(p.amount))}</td>
                        <td className="px-3 py-2.5 text-sm text-txt-light">{p.dueDate ? formatDate(p.dueDate) : "—"}</td>
                        <td className="px-3 py-2.5 text-sm text-txt-light capitalize">{p.method || "—"}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${payStatusColor[p.status] || ""}`}>
                            {payStatusLabel[p.status] || p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
