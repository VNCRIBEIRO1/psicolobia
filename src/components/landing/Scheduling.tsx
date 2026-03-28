"use client";
import { useState, useEffect, useCallback } from "react";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type AvailabilitySlot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};

type PricingItem = { label: string; key: string; duration: string; value: string };

function generateTimeSlots(start: string, end: string, interval = 60): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + interval <= endMin) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    cur += interval;
  }
  return slots;
}

export function Scheduling() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [modality, setModality] = useState("online");
  const [toast, setToast] = useState("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<{date: string; startTime: string}[]>([]);

  // Form fields for anonymous user
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    // Fetch availability from public endpoint
    fetch("/api/portal/availability")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setAvailability(Array.isArray(d) ? d : []))
      .catch(() => setAvailability([]))
      .finally(() => setLoadingAvail(false));

    // Fetch pricing from public endpoint
    fetch("/api/portal/settings?key=pricing")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.value && Array.isArray(d.value)) setPricing(d.value as PricingItem[]);
      })
      .catch(() => {});

    // Fetch booked slots to filter conflicts
    fetch("/api/portal/booked-slots")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { if (Array.isArray(d)) setBookedSlots(d); })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 5000);
  };

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

  // Check if a given day of month has availability configured
  const getDayAvailability = useCallback((d: number) => {
    const dt = new Date(year, month, d);
    const dow = dt.getDay(); // 0=Sun, 6=Sat
    return availability.filter((a) => a.dayOfWeek === dow && a.active);
  }, [year, month, availability]);

  const selectDate = useCallback((d: number) => {
    setSelDate(new Date(year, month, d));
    setSelSlot(null);
  }, [year, month]);

  // Generate available time slots for selected date (filter booked)
  const availableSlots = selDate
    ? (() => {
        const dow = selDate.getDay();
        const daySlots = availability.filter((a) => a.dayOfWeek === dow && a.active);
        const allSlots: string[] = [];
        daySlots.forEach((s) => {
          allSlots.push(...generateTimeSlots(s.startTime, s.endTime));
        });
        const unique = [...new Set(allSlots)].sort();
        // Filter out booked slots
        const dateStr = `${selDate.getFullYear()}-${String(selDate.getMonth() + 1).padStart(2, "0")}-${String(selDate.getDate()).padStart(2, "0")}`;
        return unique.filter(
          (t) => !bookedSlots.some((b) => b.date === dateStr && b.startTime === t)
        );
      })()
    : [];

  // Get price label for the selected modality
  const currentPrice = pricing.find((p) =>
    modality === "presencial" ? p.key === "individual_presencial" : p.key === "individual_online"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selDate || !selSlot) {
      showToast("⚠️ Selecione data e horário.");
      return;
    }
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      showToast("⚠️ Preencha nome, e-mail e telefone.");
      return;
    }

    setSubmitting(true);

    // Build redirect URL to /registro with booking info as params
    const dateStr = `${selDate.getFullYear()}-${String(selDate.getMonth() + 1).padStart(2, "0")}-${String(selDate.getDate()).padStart(2, "0")}`;
    const params = new URLSearchParams({
      redirect: "/portal/agendar",
      date: dateStr,
      time: selSlot,
      modality,
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      ...(formNotes.trim() ? { notes: formNotes.trim() } : {}),
    });

    // Redirect to registration page with booking data
    window.location.href = `/registro?${params.toString()}`;
  };

  const dateStr = selDate
    ? `${String(selDate.getDate()).padStart(2, "0")}/${String(selDate.getMonth() + 1).padStart(2, "0")}/${selDate.getFullYear()}`
    : "--";

  return (
    <section className="py-20 px-4 md:px-8 bg-white" id="agendamento">
      <div className="max-w-[1100px] mx-auto text-center">
        <div className="section-label justify-center flex">Agendamento</div>
        <h2 className="section-title">Agende sua Sessão</h2>
        <p className="text-txt-light max-w-[520px] mx-auto text-sm">
          Escolha a data, horário e modalidade que melhor funciona para você. Após preencher, você será direcionado(a) para criar sua conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 max-w-[1100px] mx-auto">
        {/* Calendar */}
        <div>
          <div className="bg-bg rounded-brand p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-base font-semibold">{MONTHS[month]} {year}</h3>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Mês anterior">‹</button>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Próximo mês">›</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS.map((d) => (
                <div key={d} className="text-[0.65rem] font-bold text-txt-muted py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const dt = new Date(year, month, d);
                const past = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const hasAvail = getDayAvailability(d).length > 0;
                const disabled = past || !hasAvail;
                const selected = selDate && d === selDate.getDate() && month === selDate.getMonth() && year === selDate.getFullYear();
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <button key={d} disabled={disabled}
                    onClick={() => selectDate(d)}
                    className={`text-xs p-2 rounded-lg transition-colors font-body relative
                      ${disabled ? "text-txt-muted opacity-40 cursor-default" : "hover:bg-bg-soft cursor-pointer"}
                      ${selected ? "!bg-primary !text-white font-bold" : ""}
                      ${isToday && !selected ? "border-2 border-primary font-bold" : ""}
                    `}>
                    {d}
                    {hasAvail && !past && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {loadingAvail && (
              <p className="text-center text-xs text-txt-muted mt-3">Carregando disponibilidade…</p>
            )}
            {!loadingAvail && availability.length === 0 && (
              <p className="text-center text-xs text-txt-muted mt-3">
                Nenhum horário configurado ainda. Entre em contato pelo WhatsApp.
              </p>
            )}
          </div>

          {/* Slots */}
          <div className="mt-5">
            <h4 className="font-heading text-sm font-semibold mb-3">
              🕐 Horários Disponíveis — <span className="text-primary-dark">{selDate ? dateStr : "Selecione uma data"}</span>
            </h4>
            {!selDate ? (
              <p className="text-center py-4 text-sm text-txt-muted">Selecione uma data no calendário acima</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-center py-4 text-sm text-txt-muted">Nenhum horário disponível neste dia.</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {availableSlots.map((time) => (
                  <button key={time} onClick={() => setSelSlot(time)}
                    className={`py-2 px-3 rounded-brand-sm border-[1.5px] text-xs font-semibold text-center transition-colors font-body
                      ${selSlot === time ? "bg-primary text-white border-primary" : "border-primary/20 bg-white text-txt hover:border-primary hover:bg-primary/5"}
                    `}>
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-bg rounded-brand p-6 shadow-md">
          <h3 className="font-heading text-base font-semibold mb-5">📋 Dados do Agendamento</h3>

          <div className="mb-5">
            <label className="block text-xs font-bold mb-2">Modalidade</label>
            <div className="flex gap-3">
              {[{ key: "presencial", label: "Presencial", icon: "🏢" }, { key: "online", label: "Videochamada", icon: "📹" }].map((m) => (
                <button key={m.key} type="button" onClick={() => setModality(m.key)}
                  className={`flex-1 py-2.5 rounded-brand-sm border-[1.5px] text-sm font-semibold text-center transition-colors font-body
                    ${modality === m.key ? "bg-primary text-white border-primary" : "border-primary/20 bg-white text-txt hover:border-primary"}
                  `}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-soft rounded-brand-sm p-4 mb-5 text-sm text-txt-light leading-relaxed">
            <strong className="text-primary-dark">Resumo:</strong> {modality === "presencial" ? "Presencial" : "Videochamada"} • {dateStr} às {selSlot || "--"}
            {currentPrice && (
              <span className="block text-xs text-primary-dark font-bold mt-1">
                💰 Valor: R$ {Number(currentPrice.value).toFixed(2)} ({currentPrice.duration})
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Nome completo *</label>
              <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">E-mail *</label>
              <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Telefone / WhatsApp *</label>
              <input type="tel" required value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Observações</label>
              <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Algo que gostaria de compartilhar antes da sessão?" rows={3}
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
            </div>
            <button type="submit" disabled={submitting} className="btn-brand-primary w-full justify-center disabled:opacity-50">
              {submitting ? "Redirecionando…" : "Criar Conta e Agendar 🌿"}
            </button>
            <p className="text-center text-[0.7rem] text-txt-muted">
              Você será direcionado(a) para criar sua conta antes de finalizar o agendamento.
            </p>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white px-8 py-4 rounded-brand-sm font-bold z-[300] shadow-lg text-sm animate-reveal">
          {toast}
        </div>
      )}
    </section>
  );
}
