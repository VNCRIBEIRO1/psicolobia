"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type AvailSlot = { dayOfWeek: number; startTime: string; endTime: string };
type PricingItem = { label: string; key: string; duration: string; value: string };
type BookedSlot = { date: string; startTime: string };
type BlockedDate = { date: string; reason?: string };

type Step = "date" | "time" | "confirm" | "payment" | "done";

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const endMins = eh * 60 + (em || 0);
  let h = sh, m = sm || 0;
  if (m > 0) { h++; m = 0; }
  while (h * 60 + m + 60 <= endMins) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    h++;
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
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [modality, setModality] = useState("online");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [pixKey, setPixKey] = useState("psicolobia@email.com");

  const getPrice = (): number => {
    const key = modality === "presencial" ? "individual_presencial" : "individual_online";
    const item = pricing.find((p) => p.key === key);
    return item && item.value ? Number(item.value) : 0;
  };

  const price = getPrice();

  const assistantMessages: Record<Step, string> = {
    date: loadingAvail
      ? "Carregando horários disponíveis, um momento..."
      : availability.length === 0
        ? "Nenhum horário disponível no momento. Entre em contato pelo WhatsApp para agendar."
        : "Olá! Vamos agendar sua sessão. Primeiro, escolha uma data disponível no calendário abaixo.",
    time: "Ótimo! Agora escolha o horário que funciona melhor para você. Sessões de 1 hora.",
    confirm: "Perfeito! Revise os detalhes e confirme seu agendamento.",
    payment: "Solicitação enviada! Agora envie a confirmação pelo WhatsApp e realize o pagamento via PIX.",
    done: "Tudo pronto! Sua sessão está sendo processada. Nos vemos em breve!",
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [availRes, settingsRes, apptsRes, blockedRes, bookedRes] = await Promise.all([
          fetch("/api/portal/availability"),
          fetch("/api/portal/settings"),
          fetch("/api/portal/appointments"),
          fetch("/api/portal/blocked-dates").catch(() => null),
          fetch("/api/portal/booked-slots").catch(() => null),
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
          if (data.pixKey) {
            setPixKey(data.pixKey);
          }
        }

        // Use global booked slots for conflict detection (all patients)
        if (bookedRes && bookedRes.ok) {
          const data = await bookedRes.json();
          if (Array.isArray(data)) {
            setBookedSlots(data);
          }
        } else if (apptsRes.ok) {
          // Fallback to patient's own appointments
          const data = await apptsRes.json();
          if (Array.isArray(data)) {
            const booked = data
              .map((row: Record<string, unknown>) => {
                const apt = (row.appointment ?? row) as Record<string, unknown>;
                return { date: apt.date as string, startTime: apt.startTime as string, status: apt.status as string };
              })
              .filter((a: { status: string }) => a.status !== "cancelled");
            setBookedSlots(booked);
          }
        }

        if (blockedRes && blockedRes.ok) {
          const data = await blockedRes.json();
          if (Array.isArray(data)) setBlockedDates(data);
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
    const dateStr = fmtDate(d);
    if (dt < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return false;
    if (blockedDates.some((b) => b.date === dateStr)) return false;
    return availability.some((s) => s.dayOfWeek === dow);
  };

  const getTimeSlotsForDate = (dateStr: string) => {
    const dt = new Date(dateStr + "T00:00:00");
    const dow = dt.getDay();
    const daySlots = availability.filter((s) => s.dayOfWeek === dow);
    if (daySlots.length === 0) return [];

    const allTimes: string[] = [];
    for (const slot of daySlots) {
      allTimes.push(...generateTimeSlots(slot.startTime, slot.endTime));
    }

    const unique = [...new Set(allTimes)].sort();

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

  const buildWhatsAppConfirmation = () => {
    if (!selectedDate || !selectedTime) return "";
    const [h] = selectedTime.split(":").map(Number);
    const endTime = `${String(h + 1).padStart(2, "0")}:00`;
    const dateBR = fmtDateBR(selectedDate);
    const modalityText = modality === "presencial" ? "Presencial" : "Online (videochamada)";
    const totalPrice = price || 180;

    return `*Solicitação de Agendamento — Psicolobia*\n\n` +
      `Olá, Bea! Gostaria de agendar uma sessão:\n\n` +
      `*Data:* ${dateBR}\n` +
      `*Horário:* ${selectedTime} às ${endTime} (1 hora)\n` +
      `*Modalidade:* ${modalityText}\n` +
      `*Valor:* ${formatCurrency(totalPrice)}\n\n` +
      `Aguardo a confirmação!`;
  };

  const buildPixReceiptMessage = () => {
    if (!selectedDate || !selectedTime) return "";
    const dateBR = new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });

    return `*Comprovante de Pagamento — Psicolobia*\n\n` +
      `Olá, Bea! Segue o comprovante do PIX referente à sessão de ${dateBR} às ${selectedTime}.\n\n` +
      `_(Anexe a imagem do comprovante nesta conversa)_`;
  };

  const sendWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5511988840525?text=${encoded}`, "_blank");
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/portal" className="text-xs text-primary-dark font-bold hover:underline mb-2 inline-block">
          &larr; Voltar ao portal
        </Link>
        <h1 className="font-heading text-2xl font-bold text-txt">Agendar Sessão</h1>
      </div>

      {/* Assistant */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-brand p-5 mb-6 flex items-start gap-3">
        <span className="text-2xl">&#129302;</span>
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
              {(["date", "time", "confirm", "payment"].indexOf(step) > i) ? "\u2713" : i + 1}
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
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors">&lsaquo;</button>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors">&rsaquo;</button>
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
              const dateStr = fmtDate(d);
              const isBlocked = blockedDates.some((b) => b.date === dateStr);
              return (
                <button
                  key={d}
                  onClick={() => handleSelectDate(d)}
                  disabled={!avail}
                  className={`h-10 rounded-brand-sm text-sm font-medium transition-colors relative
                    ${avail ? "hover:bg-primary hover:text-white cursor-pointer" : "text-gray-300 cursor-not-allowed"}
                    ${isToday ? "border-2 border-primary text-primary-dark" : ""}
                    ${isBlocked ? "bg-red-50 line-through" : ""}
                    ${avail ? "text-txt" : ""}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {availability.length === 0 && (
            <p className="text-sm text-txt-muted text-center mt-4">
              {loadingAvail ? "Carregando horários disponíveis..." : "Nenhum horário configurado. Entre em contato pelo WhatsApp."}
            </p>
          )}
        </div>
      )}

      {/* STEP: TIME */}
      {step === "time" && selectedDate && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 max-w-xl">
          <h3 className="font-heading text-base font-semibold text-txt mb-2">
            {fmtDateBR(selectedDate)}
          </h3>
          <p className="text-sm text-txt-muted mb-4">Selecione o horário da sessão (1 hora):</p>

          {getTimeSlotsForDate(selectedDate).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-txt-muted">Todos os horários deste dia já estão ocupados.</p>
              <button
                onClick={() => { setStep("date"); setSelectedDate(null); }}
                className="mt-3 text-xs text-primary-dark font-bold hover:underline"
              >
                &larr; Escolher outra data
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
                &larr; Escolher outra data
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
              <span className="text-txt font-medium">{selectedTime} - {String(Number(selectedTime.split(":")[0]) + 1).padStart(2, "0")}:00 (1 hora)</span>
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
                  Online
                </button>
                <button
                  onClick={() => setModality("presencial")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    modality === "presencial" ? "bg-primary text-white" : "bg-gray-100 text-txt-light"
                  }`}
                >
                  Presencial
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
              placeholder="Alguma observação para a sessão..."
              className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={handleConfirm} disabled={saving} className="btn-brand-primary flex-1 disabled:opacity-50">
              {saving ? "Agendando..." : "Confirmar Agendamento"}
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
            <span className="text-4xl">&#9989;</span>
            <h3 className="font-heading text-lg font-semibold text-txt mt-3">Sessão Solicitada!</h3>
            <p className="text-sm text-txt-muted mt-1">
              {fmtDateBR(selectedDate!)} às {selectedTime}
            </p>
          </div>

          {/* Step 1: Send WhatsApp Confirmation */}
          <div className="bg-[#dcf8c6] border border-green-300 rounded-brand-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#25D366] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <p className="text-sm font-semibold text-green-900">Confirme pelo WhatsApp</p>
            </div>
            <p className="text-xs text-green-800 mb-3">
              Envie a mensagem abaixo para a Bea confirmar seu agendamento:
            </p>
            <pre className="text-xs text-green-900 whitespace-pre-wrap font-body leading-relaxed bg-white/50 rounded-brand-sm p-3 max-h-36 overflow-y-auto">
              {buildWhatsAppConfirmation()}
            </pre>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => sendWhatsApp(buildWhatsAppConfirmation())}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-brand-sm hover:bg-[#1da855] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Enviar pelo WhatsApp
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(buildWhatsAppConfirmation());
                  const el = document.getElementById("msg-feedback");
                  if (el) { el.textContent = "Copiada!"; setTimeout(() => { el.textContent = ""; }, 2000); }
                }}
                className="text-xs text-green-800 font-bold hover:underline"
              >
                Copiar
              </button>
              <span id="msg-feedback" className="text-xs text-green-600 self-center"></span>
            </div>
          </div>

          {/* Step 2: PIX Payment */}
          <div className="bg-primary/5 border border-primary/20 rounded-brand-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <p className="text-sm font-semibold text-txt">Realize o pagamento via PIX</p>
            </div>
            <div className="bg-white rounded-brand-sm p-3 border border-primary/10 mb-3">
              <p className="text-xs text-txt-muted mb-1">Chave PIX:</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-primary-dark font-mono font-bold">{pixKey}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pixKey);
                    const el = document.getElementById("pix-feedback");
                    if (el) { el.textContent = "Copiado!"; setTimeout(() => { el.textContent = ""; }, 2000); }
                  }}
                  className="text-xs text-primary-dark hover:underline"
                >
                  Copiar
                </button>
                <span id="pix-feedback" className="text-xs text-green-600"></span>
              </div>
              {price > 0 && (
                <p className="text-sm text-txt font-bold mt-2">Valor: {formatCurrency(price)}</p>
              )}
            </div>
          </div>

          {/* Step 3: Send PIX Receipt */}
          <div className="bg-green-50 border border-green-200 rounded-brand-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <p className="text-sm font-semibold text-green-900">Envie o comprovante pelo WhatsApp</p>
            </div>
            <p className="text-xs text-green-700 mb-3">
              Após realizar o pagamento via PIX, envie o comprovante para a Bea pelo WhatsApp.
              Sua sessão será confirmada assim que o pagamento for verificado.
            </p>
            <button
              onClick={() => sendWhatsApp(buildPixReceiptMessage())}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-brand-sm hover:bg-[#1da855] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Enviar Comprovante pelo WhatsApp
            </button>
          </div>

          {/* Info banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-brand-sm p-3 mb-6">
            <p className="text-xs text-yellow-800">
              <strong>Próximos passos:</strong> Após a Bea confirmar seu agendamento e pagamento,
              o status da sua sessão mudará para &quot;Confirmada&quot; no painel. Se a sessão for online,
              o link da videochamada será liberado antes do horário.
            </p>
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
          <span className="text-5xl">&#127881;</span>
          <h3 className="font-heading text-lg font-semibold text-txt mt-4">Tudo pronto!</h3>
          <p className="text-sm text-txt-muted mt-2 mb-6">
            Sua sessão foi solicitada. Acompanhe o status no painel de sessões.
            A Bea irá confirmar assim que verificar o pagamento.
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
