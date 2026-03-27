"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type RecordRow = {
  id: string;
  patientId: string;
  patientName: string;
  sessionDate: string;
  sessionNumber: number | null;
  chiefComplaint: string | null;
  clinicalNotes: string | null;
  mood: string | null;
};

export default function ProntuariosPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/clinical-records")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRecords(Array.isArray(d) ? d : []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) =>
    r.patientName?.toLowerCase().includes(search.toLowerCase())
  );

  const moodLabel: Record<string, string> = {
    muito_bem: "😊 Muito bem",
    bem: "🙂 Bem",
    neutro: "😐 Neutro",
    mal: "😟 Mal",
    muito_mal: "😢 Muito mal",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Prontuários</h1>
        <p className="text-sm text-txt-light mt-1">Registros clínicos dos pacientes</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome do paciente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md py-2.5 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-brand shadow-sm border border-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10 bg-bg">
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Paciente</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Data da Sessão</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Sessão Nº</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Humor</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Queixa</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-txt-muted">Carregando…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-txt-muted">
                    {search ? "Nenhum registro encontrado para a busca." : "Nenhum registro clínico cadastrado. Acesse a ficha de um paciente para criar registros."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-primary/5 hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-txt">{r.patientName || "—"}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{formatDate(r.sessionDate)}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{r.sessionNumber ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{r.mood ? (moodLabel[r.mood] || r.mood) : "—"}</td>
                    <td className="px-6 py-4 text-sm text-txt-light max-w-[200px] truncate">{r.chiefComplaint || "—"}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/pacientes/${r.patientId}`}
                        className="text-xs text-primary-dark font-bold hover:underline"
                      >
                        Ver paciente
                      </Link>
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
