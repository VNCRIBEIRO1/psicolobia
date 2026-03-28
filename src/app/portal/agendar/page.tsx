"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type AvailSlot = { dayOfWeek: number; startTime: string; endTime: string };
type PricingItem = { label: string; key: string; duration: string; value: string };
type BookedSlot = { date: string; startTime: string };

type Step = "date" | "time" | "confirm" | "payment" | "done";

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const endMins = eh * 60 + (em || 0);
  let h = sh, m = sm || 0;
  // Round up to next full hour if not on the hour
  if (m > 0) { h++; m = 0; }
  while (h * 60 + m + 60 <= endMins) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    h++; // 60-min sessions, advance 1 hour
  }
  return slots;
}

export default function AgendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [availability, setAvailability] = useState<AvailSlot[]>([]);
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [modality, setModality] = useState("online");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [whatsappMsg, setWhatsappMsg] = useState("");

  // Get price for current modality
  const getPrice = (): number => {
    const key = modality === "presencial" ? "individual_presencial" : "individual_online";
    const item = pricing.find((p) => p.key === key);
    return item && item.value ? Number(item.value) : 0;
  };

  const price = getPrice();

  // Assistant messages
  const assistantMessages: Record<Step, string> = {
    date: loadingAvail
      ? "⏳ Carregando horários disponíveis, um momento…"
      : availability.length === 0
        ? "😔 Nenhum horário disponível no momento. Entre em contato pelo WhatsApp para agendar."
        : "🌿 Olá! Vamos agendar sua sessão. Primeiro, escolha uma data disponível no calendário abaixo.",
    time: "Ótimo! Agora escolha o horário que funciona melhor para você. Sessões de 1 hora.",
    confirm: "Perfeito! Revise os detalhes e confirme seu agendamento.",
    payment: "✅ Sessão agendada com sucesso! Agora finalize o pagamento para confirmar.",
    done: "🎉 Tudo pronto! Sua sessão está confirmada. Nos vemos em breve!",
  };

  useEffect(() => {
    // Fetch availability, pricing, and booked appointments
    const init = async () => {
      try {
        const [availRes, settingsRes, apptsRes] = await Promise.all([
          fetch("/api/portal/availability"),
          fetch("/api/portal/settings"),
          fetch("/api/portal/appointments"),
        ]);

        if (availRes.ok) {
          const data = await availRes.json();
          setAvailability(Array.isArray(data) ? data : []);
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data.pricing && Array.isArray(data.pricing)) {
            setPricing(data.pricing);
          }
        }

        if (apptsRes.ok) {
          const data = await apptsRes.json();
          if (Array.isArray(data)) {
            // Get all non-cancelled appointments as booked slots
            const booked = data
              .map((row: Record<string, unknown>) => {
                const apt = (row.appointment ?? row) as Record<string, unknown>;
                return { date: apt.date as string, startTime: apt.startTime as string, status: apt.status as string };
              })
              .filter((a: { status: string }) => a.status !== "cancelled");
            setBookedSlots(booked);
          }
        }
      } catch { /* network error */ }
      setLoadingAvail(false);
    };
    init();
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
    // Gather all availability windows for this day
    const daySlots = availability.filter((s) => s.dayOfWeek === dow);
    if (daySlots.length === 0) return [];

    const allTimes: string[] = [];
    for (const slot of daySlots) {
      allTimes.push(...generateTimeSlots(slot.startTime, slot.endTime));
    }

    // Remove duplicates and sort
    const unique = [...new Set(allTimes)].sort();

    // Filter out already booked slots
    return unique.filter(
      (t) => !bookedSlots.some((b) => b.date === dateStr && b.startTime === t)
    );
  };

  const handleSelectDate = (d: number) => {
    if (!isAvailableDay(d)) return;
    setSelectedDate(fmtDate(d));
    setSelectedTime(null);
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

    // 1 hour sessions
    const [h, m] = selectedTime.split(":").map(Number);
    const endH = h + 1;
    const endTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

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
        const appt = await res.json();
        const appointmentId = appt.id || "test";
        const totalPrice = price || 180;
        const fakeLink = `https://psicolobia.vercel.app/pagamento/${appointmentId}?valor=${totalPrice}&ref=${Date.now()}`;
        setPaymentLink(fakeLink);

        // Generate WhatsApp confirmation message
        const dateBR = new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        const modalityText = modality === "presencial" ? "Presencial" : "Online (videochamada)";

        const msg = `✨ *Confirmação de Agendamento — Psicolobia*\n\n` +
          `Olá! Segue a confirmação da sua sessão:\n\n` +
          `📅 *Data:* ${dateBR}\n` +
          `⏰ *Horário:* ${selectedTime} às ${endTime} (1 hora)\n` +
          `📍 *Modalidade:* ${modalityText}\n` +
          `💰 *Valor:* ${formatCurrency(totalPrice)}\n\n` +
          `💳 *Link de pagamento:*\n${fakeLink}\n\n` +
          `🔑 *Chave PIX:* psicolobia@email.com\n\n` +
          `Após o pagamento, envie o comprovante aqui. ` +
          `Sua sessão será confirmada assim que o pagamento for verificado.\n\n` +
          `Qualquer dúvida, estou à disposição! 🌿\n` +
          `— Bea | Psicolobia`;

        setWhatsappMsg(msg);

        // Add to booked list locally
        setBookedSlots((prev) => [...prev, { date: selectedDate, startTime: selectedTime }]);

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

  const sendWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappMsg);
    window.open(`https://wa.me/5511988840525?text=${encoded}`, "_blank");
  };

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
            <p className="text-sm text-txt-muted text-center mt-4">
              {loadingAvail ? "⏳ Carregando horários disponíveis…" : "Nenhum horário configurado. Entre em contato pelo WhatsApp."}
            </p>
          )}
        </div>
      )}

      {/* STEP: TIME */}
      {step === "time" && selectedDate && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 max-w-xl">
          <h3 className="font-heading text-base font-semibold text-txt mb-2">
            📅 {fmtDateBR(selectedDate)}
          </h3>
          <p className="text-sm text-txt-muted mb-4">Selecione o horário da sessão (1 hora):</p>

          {getTimeSlotsForDate(selectedDate).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-txt-muted">😔 Todos os horários deste dia já estão ocupados.</p>
              <button
                onClick={() => { setStep("date"); setSelectedDate(null); }}
                className="mt-3 text-xs text-primary-dark font-bold hover:underline"
              >
                ← Escolher outra data
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
                {getTimeSlotsForDate(selectedDate).map((t) => {
                  const endH = Number(t.split(":")[0]) + 1;
                  const endStr = `${String(endH).padStart(2, "0")}:00`;
                  return (
                    <button
                      key={t}
                      onClick={() => handleSelectTime(t)}
                      className={`py-2.5 px-3 rounded-brand-sm text-sm font-medium border transition-colors
                        ${selectedTime === t
                          ? "border-primary bg-primary text-white"
                          : "border-primary/15 text-txt hover:border-primary hover:bg-primary/5"
                        }`}
                    >
                      <span>{t}</span>
                      <span className="block text-[0.65rem] opacity-70">até {endStr}</span>
                    </button>
                  );
                })}
              </div>

              <button onClick={() => { setStep("date"); setSelectedDate(null); }} className="text-xs text-primary-dark font-bold hover:underline">
                ← Escolher outra data
              </button>
            </>
          )}
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
              <span className="text-txt font-medium">{selectedTime} – {String(Number(selectedTime.split(":")[0]) + 1).padStart(2, "0")}:00 (1 hora)</span>
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
            {price > 0 && (
              <div className="flex justify-between py-2 border-b border-primary/5">
                <span className="text-txt-muted">Valor</span>
                <span className="text-txt font-bold text-lg">{formatCurrency(price)}</span>
              </div>
            )}
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
              Para confirmar sua sessão, realize o pagamento de <strong>{formatCurrency(price || 180)}</strong> via PIX ou cartão.
            </p>
            <div className="bg-white rounded-brand-sm p-3 border border-yellow-100">
              <p className="text-xs text-txt-muted mb-1">Link de pagamento (teste):</p>
              <p className="text-xs text-primary-dark font-mono break-all">{paymentLink}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(paymentLink);
                setError("");
                const el = document.getElementById("copy-feedback");
                if (el) { el.textContent = "✅ Link copiado!"; setTimeout(() => { el.textContent = ""; }, 2000); }
              }}
              className="mt-3 text-xs text-yellow-800 font-bold hover:underline"
            >
              📋 Copiar link de pagamento
            </button>
            <span id="copy-feedback" className="ml-2 text-xs text-green-600"></span>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-brand-sm p-4 mb-6">
            <p className="text-sm font-semibold text-green-800 mb-1">🔑 Chave PIX (teste)</p>
            <p className="text-sm text-green-700 font-mono">psicolobia@email.com</p>
            <p className="text-xs text-green-600 mt-1">Valor: {formatCurrency(price || 180)}</p>
          </div>

          {/* WhatsApp Confirmation Message */}
          <div className="bg-[#dcf8c6] border border-green-300 rounded-brand-sm p-4 mb-6">
            <p className="text-sm font-semibold text-green-900 mb-2">📱 Mensagem de Confirmação (WhatsApp)</p>
            <pre className="text-xs text-green-900 whitespace-pre-wrap font-body leading-relaxed max-h-48 overflow-y-auto">
              {whatsappMsg}
            </pre>
            <div className="flex gap-2 mt-3">
              <button
                onClick={sendWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-brand-sm hover:bg-[#1da855] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Enviar pelo WhatsApp
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(whatsappMsg);
                  const el = document.getElementById("msg-feedback");
                  if (el) { el.textContent = "✅ Copiada!"; setTimeout(() => { el.textContent = ""; }, 2000); }
                }}
                className="text-xs text-green-800 font-bold hover:underline"
              >
                📋 Copiar mensagem
              </button>
              <span id="msg-feedback" className="text-xs text-green-600 self-center"></span>
            </div>
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
