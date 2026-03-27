"use client";
import { useState, useCallback } from "react";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const SLOTS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function Scheduling() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [modality, setModality] = useState("Presencial");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
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

  const selectDate = useCallback((d: number) => {
    setSelDate(new Date(year, month, d));
    setSelSlot(null);
  }, [year, month]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selDate || !selSlot) {
      showToast("⚠️ Selecione data e horário.");
      return;
    }
    showToast("✅ Agendamento solicitado com sucesso! Retornaremos a confirmação por e-mail 🌿");
    setSelDate(null);
    setSelSlot(null);
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
          Escolha a data, horário e modalidade que melhor funciona para você. Retornaremos a confirmação por e-mail.
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
                const sun = dt.getDay() === 0;
                const selected = selDate && d === selDate.getDate() && month === selDate.getMonth() && year === selDate.getFullYear();
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                return (
                  <button key={d} disabled={past || sun}
                    onClick={() => selectDate(d)}
                    className={`text-xs p-2 rounded-lg transition-colors font-body
                      ${past || sun ? "text-txt-muted opacity-40 cursor-default" : "hover:bg-bg-soft cursor-pointer"}
                      ${selected ? "!bg-primary !text-white font-bold" : ""}
                      ${isToday && !selected ? "border-2 border-primary font-bold" : ""}
                    `}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          <div className="mt-5">
            <h4 className="font-heading text-sm font-semibold mb-3">
              🕐 Horários Disponíveis — <span className="text-primary-dark">{selDate ? dateStr : "Selecione uma data"}</span>
            </h4>
            {!selDate ? (
              <p className="text-center py-4 text-sm text-txt-muted">Selecione uma data no calendário acima</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {SLOTS.map((time) => (
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
              {["Presencial", "Videochamada"].map((m) => (
                <button key={m} type="button" onClick={() => setModality(m)}
                  className={`flex-1 py-2.5 rounded-brand-sm border-[1.5px] text-sm font-semibold text-center transition-colors font-body
                    ${modality === m ? "bg-primary text-white border-primary" : "border-primary/20 bg-white text-txt hover:border-primary"}
                  `}>
                  {m === "Presencial" ? "🏢" : "📹"} {m}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-soft rounded-brand-sm p-4 mb-5 text-sm text-txt-light leading-relaxed">
            <strong className="text-primary-dark">Resumo:</strong> {modality} • {dateStr} às {selSlot || "--"}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Nome completo *</label>
              <input type="text" required placeholder="Seu nome completo"
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">E-mail *</label>
              <input type="email" required placeholder="seu@email.com"
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Telefone *</label>
              <input type="tel" required placeholder="(00) 99999-9999"
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Observações</label>
              <textarea placeholder="Algo que gostaria de compartilhar antes da sessão?" rows={3}
                className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-y" />
            </div>
            <button type="submit" className="btn-brand-primary w-full justify-center">
              Solicitar Agendamento 🌿
            </button>
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
