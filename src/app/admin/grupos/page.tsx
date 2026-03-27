"use client";
import { useState, useEffect } from "react";

type Group = {
  id: string;
  name: string;
  modality: string;
  dayOfWeek: string | null;
  time: string | null;
  maxParticipants: number;
  active: boolean;
};

export default function GruposAdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setGroups(Array.isArray(d) ? d : []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-txt">Grupos Terapêuticos</h1>
          <p className="text-sm text-txt-light mt-1">Gerencie grupos e participantes</p>
        </div>
        <button className="btn-brand-primary text-sm">+ Novo Grupo</button>
      </div>

      <div className="bg-white rounded-brand shadow-sm border border-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/10 bg-bg">
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Grupo</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Modalidade</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Dia/Hora</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Vagas</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-txt-muted uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-txt-muted">
                    {loading ? "Carregando..." : "Nenhum grupo cadastrado. Clique em \"+ Novo Grupo\" para criar."}
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={g.id} className="border-b border-primary/5 hover:bg-bg/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-txt">{g.name}</td>
                    <td className="px-6 py-4 text-sm text-txt-light capitalize">{g.modality}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{g.dayOfWeek || "—"} {g.time || ""}</td>
                    <td className="px-6 py-4 text-sm text-txt-light">{g.maxParticipants}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold ${g.active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                        {g.active ? "Ativo" : "Inativo"}
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
