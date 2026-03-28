"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

const moodOptions = [
  { value: "muito_bem", emoji: "😄", label: "Muito bem" },
  { value: "bem", emoji: "🙂", label: "Bem" },
  { value: "neutro", emoji: "😐", label: "Neutro" },
  { value: "mal", emoji: "😟", label: "Mal" },
  { value: "muito_mal", emoji: "😢", label: "Muito mal" },
];

const sleepOptions = [
  { value: "otimo", label: "Ótimo — dormi bem" },
  { value: "bom", label: "Bom — poderia ser melhor" },
  { value: "regular", label: "Regular — noite agitada" },
  { value: "ruim", label: "Ruim — quase não dormi" },
  { value: "pessimo", label: "Péssimo — insônia" },
];

export default function TriagemPage() {
  const { id: appointmentId } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState("");

  // Form state
  const [mood, setMood] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [mainConcern, setMainConcern] = useState("");
  const [recentEvents, setRecentEvents] = useState("");
  const [medicationChanges, setMedicationChanges] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    if (!appointmentId) return;
    fetch(`/api/portal/triagem?appointmentId=${appointmentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.completed) {
          setDone(true);
          setMood(data.mood || "");
          setSleepQuality(data.sleepQuality || "");
          setAnxietyLevel(data.anxietyLevel ?? 5);
          setMainConcern(data.mainConcern || "");
          setRecentEvents(data.recentEvents || "");
          setMedicationChanges(data.medicationChanges || "");
          setAdditionalNotes(data.additionalNotes || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/portal/triagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          mood,
          sleepQuality,
          anxietyLevel,
          mainConcern,
          recentEvents,
          medicationChanges,
          additionalNotes,
        }),
      });
      if (res.ok) {
        setDone(true);
        flash("Triagem salva com sucesso! Redirecionando… ✅");
        // Auto-redirect to Sala de Espera after 2 seconds
        setTimeout(() => {
          router.push(`/portal/sala-espera/${appointmentId}`);
        }, 2000);
      } else {
        flash("Erro ao salvar triagem.");
      }
    } catch {
      flash("Erro de conexão.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-txt-muted">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-primary/20 text-txt text-sm px-5 py-3 rounded-brand-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <Link
          href="/portal/sessoes"
          className="text-xs text-primary-dark font-bold hover:underline mb-2 inline-block"
        >
          ← Voltar às sessões
        </Link>
        <h1 className="font-heading text-2xl font-bold text-txt">Triagem Pré-Sessão</h1>
        <p className="text-sm text-txt-light mt-1">
          Preencha este breve questionário antes da sua sessão. Isso ajuda a Bea a se preparar para te atender da melhor forma. 🌿
        </p>
      </div>

      {done && (
        <div className="bg-green-50 border border-green-200 rounded-brand p-5 mb-6 text-center">
          <span className="text-3xl">✅</span>
          <h3 className="font-heading text-base font-semibold text-green-800 mt-2">
            Triagem já preenchida!
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Você pode editar abaixo ou seguir para a sala de espera.
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <Link
              href={`/portal/sala-espera/${appointmentId}`}
              className="btn-brand-primary text-sm"
            >
              Ir para Sala de Espera →
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-sm font-semibold text-txt mb-3">
            Como você está se sentindo agora? *
          </h3>
          <div className="flex gap-2 flex-wrap">
            {moodOptions.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-brand-sm border-[1.5px] transition-colors ${
                  mood === m.value
                    ? "border-primary bg-primary/10"
                    : "border-primary/10 hover:border-primary/30"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-medium text-txt">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-sm font-semibold text-txt mb-3">
            Como foi seu sono recentemente?
          </h3>
          <div className="space-y-2">
            {sleepOptions.map((s) => (
              <label
                key={s.value}
                className={`flex items-center gap-3 p-3 rounded-brand-sm border-[1.5px] cursor-pointer transition-colors ${
                  sleepQuality === s.value
                    ? "border-primary bg-primary/10"
                    : "border-primary/10 hover:border-primary/20"
                }`}
              >
                <input
                  type="radio"
                  name="sleep"
                  value={s.value}
                  checked={sleepQuality === s.value}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  className="accent-primary"
                />
                <span className="text-sm text-txt">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Anxiety Level */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-sm font-semibold text-txt mb-3">
            Nível de ansiedade (0 = nenhuma, 10 = máxima)
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-txt-muted">0</span>
            <input
              type="range"
              min={0}
              max={10}
              value={anxietyLevel}
              onChange={(e) => setAnxietyLevel(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm text-txt-muted">10</span>
          </div>
          <p className="text-center text-lg font-bold text-primary-dark mt-2">{anxietyLevel}</p>
        </div>

        {/* Main concern */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-sm font-semibold text-txt mb-3">
            Qual é sua principal preocupação para esta sessão? *
          </h3>
          <textarea
            value={mainConcern}
            onChange={(e) => setMainConcern(e.target.value)}
            rows={3}
            placeholder="O que gostaria de trabalhar hoje…"
            className={inputCls + " resize-y"}
          />
        </div>

        {/* Recent events */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-sm font-semibold text-txt mb-3">
            Aconteceu algo significativo desde a última sessão?
          </h3>
          <textarea
            value={recentEvents}
            onChange={(e) => setRecentEvents(e.target.value)}
            rows={3}
            placeholder="Eventos, mudanças, situações marcantes…"
            className={inputCls + " resize-y"}
          />
        </div>

        {/* Medication */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-sm font-semibold text-txt mb-3">
            Houve mudança em medicação?
          </h3>
          <input
            value={medicationChanges}
            onChange={(e) => setMedicationChanges(e.target.value)}
            placeholder="Novo remédio, mudança de dose, parou algum…"
            className={inputCls}
          />
        </div>

        {/* Additional notes */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-sm font-semibold text-txt mb-3">
            Observações adicionais
          </h3>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={2}
            placeholder="Qualquer coisa a mais que queira compartilhar…"
            className={inputCls + " resize-y"}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || !mood}
            className="btn-brand-primary flex-1 disabled:opacity-50"
          >
            {saving ? "Salvando…" : done ? "Atualizar Triagem 🌿" : "Enviar Triagem 🌿"}
          </button>
          <Link
            href={`/portal/sala-espera/${appointmentId}`}
            className="px-4 py-2.5 border-[1.5px] border-primary/15 rounded-brand-sm text-sm text-txt hover:bg-bg transition-colors text-center"
          >
            {done ? "Sala de Espera →" : "Pular"}
          </Link>
        </div>
      </form>
    </div>
  );
}
