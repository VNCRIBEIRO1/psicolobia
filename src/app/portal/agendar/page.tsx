"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type AvailSlot = { dayOfWeek: number; startTime: string; endTime: string };

type Step = "date" | "time" | "confirm" | "payment" | "done";

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh] = end.split(":").map(Number);
  let h = sh, m = sm;
  while (h < eh || (h === eh && m === 0)) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 50; // 50 min sessions
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
}

export default function AgendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [availability, setAvailability] = useState<AvailSlot[]>([]);
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [modality, setModality] = useState("online");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  // Assistant messages
  const assistantMessages: Record<Step, string> = {
    date: "🌿 Olá! Vamos agendar sua sessão. Primeiro, escolha uma data disponível no calendário abaixo.",
    time: "Ótimo! Agora escolha o horário que funciona melhor para você.",
    confirm: "Perfeito! Revise os detalhes e confirme seu agendamento.",
    payment: "✅ Sessão agendada com sucesso! Agora finalize o pagamento para confirmar.",
    done: "🎉 Tudo pronto! Sua sessão está confirmada. Nos vemos em breve!",
  };

  useEffect(() => {
    fetch("/api/portal/availability")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAvailability(Array.isArray(data) ? data : []))
      .catch(() => setAvailability([]));
  }, []);

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

  const isAvailableDay = (d: number) => {
    const dt = new Date(year, month, d);
    const dow = dt.getDay();
    if (dt < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
    return availability.some((s) => s.dayOfWeek === dow);
  };

  const getTimeSlotsForDate = (dateStr: string) => {
    const dt = new Date(dateStr + "T00:00:00");
    const dow = dt.getDay();
    const slot = availability.find((s) => s.dayOfWeek === dow);
    if (!slot) return [];
    return generateTimeSlots(slot.startTime, slot.endTime);
  };

  const handleSelectDate = (d: number) => {
    if (!isAvailableDay(d)) return;
    setSelectedDate(fmtDate(d));
    setStep("time");
  };

  const handleSelectTime = (t: string) => {
    setSelectedTime(t);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    setSaving(true);
    setError("");

    const [h, m] = selectedTime.split(":").map(Number);
    let endH = h;
    let endM = m + 50;
    if (endM >= 60) { endH++; endM -= 60; }
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/portal/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          startTime: selectedTime,
          endTime,
          modality,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        // Generate fictitious payment link
        const appointmentId = (await res.json()).id || "test";
        const fakeLink = `https://psicolobia.vercel.app/pagamento/${appointmentId}?valor=180&ref=${Date.now()}`;
        setPaymentLink(fakeLink);
        setStep("payment");
      } else {
        const body = await res.json().catch(() => ({}));
        setError((body as Record<string, string>).error || "Erro ao agendar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
    }
    setSaving(false);
  };

  const fmtDateBR = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-6">
        <Link href="/portal" className="text-xs text-primary-dark font-bold hover:underline mb-2 inline-block">
          ← Voltar ao portal
        </Link>
        <h1 className="font-heading text-2xl font-bold text-txt">Agendar Sessão</h1>
      </div>

      {/* Assistant */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-brand p-5 mb-6 flex items-start gap-3">
        <span className="text-2xl">🤖</span>
        <div>
          <p className="text-sm font-semibold text-txt mb-1">Assistente de Agendamento</p>
          <p className="text-sm text-txt-light">{assistantMessages[step]}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-brand-sm mb-6">{error}</div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["date", "time", "confirm", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s ? "bg-primary text-white" :
              (["date", "time", "confirm", "payment"].indexOf(step) > i) ? "bg-green-500 text-white" :
              "bg-gray-200 text-gray-500"
            }`}>
              {(["date", "time", "confirm", "payment"].indexOf(step) > i) ? "✓" : i + 1}
            </div>
            {i < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* STEP: DATE */}
      {step === "date" && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 max-w-xl">
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
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const avail = isAvailableDay(d);
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <button
                  key={d}
                  onClick={() => handleSelectDate(d)}
                  disabled={!avail}
                  className={`h-10 rounded-brand-sm text-sm font-medium transition-colors
                    ${avail ? "hover:bg-primary hover:text-white cursor-pointer" : "text-gray-300 cursor-not-allowed"}
                    ${isToday ? "border-2 border-primary text-primary-dark" : ""}
                    ${avail ? "text-txt" : ""}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {availability.length === 0 && (
            <p className="text-sm text-txt-muted text-center mt-4">Carregando horários disponíveis…</p>
          )}
        </div>
      )}

      {/* STEP: TIME */}
      {step === "time" && selectedDate && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 max-w-xl">
          <h3 className="font-heading text-base font-semibold text-txt mb-2">
            📅 {fmtDateBR(selectedDate)}
          </h3>
          <p className="text-sm text-txt-muted mb-4">Selecione o horário da sessão (50 minutos):</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
            {getTimeSlotsForDate(selectedDate).map((t) => (
              <button
                key={t}
                onClick={() => handleSelectTime(t)}
                className={`py-2.5 px-3 rounded-brand-sm text-sm font-medium border transition-colors
                  ${selectedTime === t
                    ? "border-primary bg-primary text-white"
                    : "border-primary/15 text-txt hover:border-primary hover:bg-primary/5"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button onClick={() => { setStep("date"); setSelectedDate(null); }} className="text-xs text-primary-dark font-bold hover:underline">
            ← Escolher outra data
          </button>
        </div>
      )}

      {/* STEP: CONFIRM */}
      {step === "confirm" && selectedDate && selectedTime && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 max-w-xl">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">Confirme seu Agendamento</h3>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between py-2 border-b border-primary/5">
              <span className="text-txt-muted">Data</span>
              <span className="text-txt font-medium">{fmtDateBR(selectedDate)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-primary/5">
              <span className="text-txt-muted">Horário</span>
              <span className="text-txt font-medium">{selectedTime} (50 min)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-primary/5">
              <span className="text-txt-muted">Modalidade</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setModality("online")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    modality === "online" ? "bg-primary text-white" : "bg-gray-100 text-txt-light"
                  }`}
                >
                  📹 Online
                </button>
                <button
                  onClick={() => setModality("presencial")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    modality === "presencial" ? "bg-primary text-white" : "bg-gray-100 text-txt-light"
                  }`}
                >
                  🏢 Presencial
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold mb-1.5">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Alguma observação para a sessão…"
              className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={handleConfirm} disabled={saving} className="btn-brand-primary flex-1 disabled:opacity-50">
              {saving ? "Agendando…" : "Confirmar Agendamento 🌿"}
            </button>
            <button onClick={() => setStep("time")} className="px-4 py-2.5 border-[1.5px] border-primary/15 rounded-brand-sm text-sm text-txt hover:bg-bg transition-colors">
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* STEP: PAYMENT */}
      {step === "payment" && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 max-w-xl">
          <div className="text-center mb-6">
            <span className="text-4xl">✅</span>
            <h3 className="font-heading text-lg font-semibold text-txt mt-3">Sessão Agendada!</h3>
            <p className="text-sm text-txt-muted mt-1">
              {fmtDateBR(selectedDate!)} às {selectedTime}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-brand-sm p-4 mb-6">
            <p className="text-sm font-semibold text-yellow-800 mb-2">💳 Pagamento Pendente</p>
            <p className="text-xs text-yellow-700 mb-3">
              Para confirmar sua sessão, realize o pagamento de <strong>R$ 180,00</strong> via PIX ou cartão.
            </p>
            <div className="bg-white rounded-brand-sm p-3 border border-yellow-100">
              <p className="text-xs text-txt-muted mb-1">Link de pagamento (teste):</p>
              <p className="text-xs text-primary-dark font-mono break-all">{paymentLink}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(paymentLink);
                alert("Link copiado!");
              }}
              className="mt-3 text-xs text-yellow-800 font-bold hover:underline"
            >
              📋 Copiar link de pagamento
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-brand-sm p-4 mb-6">
            <p className="text-sm font-semibold text-green-800 mb-1">🔑 Chave PIX (teste)</p>
            <p className="text-sm text-green-700 font-mono">psicolobia@email.com</p>
            <p className="text-xs text-green-600 mt-1">Valor: R$ 180,00</p>
          </div>

          <div className="flex gap-3">
            <Link href="/portal/sessoes" className="btn-brand-primary flex-1 text-center">
              Ver Minhas Sessões
            </Link>
            <button onClick={() => setStep("done")} className="px-4 py-2.5 border-[1.5px] border-primary/15 rounded-brand-sm text-sm text-txt hover:bg-bg transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* STEP: DONE */}
      {step === "done" && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 max-w-xl text-center">
          <span className="text-5xl">🎉</span>
          <h3 className="font-heading text-lg font-semibold text-txt mt-4">Tudo pronto!</h3>
          <p className="text-sm text-txt-muted mt-2 mb-6">
            Sua sessão está agendada. Você receberá uma confirmação quando o pagamento for processado.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/portal" className="btn-brand-primary">Voltar ao Portal</Link>
            <Link href="/portal/sessoes" className="btn-brand-outline">Ver Sessões</Link>
          </div>
        </div>
      )}
    </div>
  );
}
