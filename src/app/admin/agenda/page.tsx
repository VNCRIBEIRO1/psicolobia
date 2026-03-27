"use client";
import { useState } from "react";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendaPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-txt">Agenda</h1>
          <p className="text-sm text-txt-light mt-1">Gerencie seus agendamentos</p>
        </div>
        <button className="btn-brand-primary text-sm">+ Nova Sessão</button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
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

            return (
              <div key={d}
                className={`min-h-[80px] p-2 rounded-brand-sm border border-primary/5 transition-colors
                  ${isToday ? "border-primary bg-primary/5" : ""}
                  ${isWeekend ? "bg-gray-50/50" : "hover:bg-bg/50"}`}>
                <span className={`text-xs font-semibold ${isToday ? "text-primary-dark" : "text-txt-light"}`}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
