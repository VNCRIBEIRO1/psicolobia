"use client";
import { useState, useRef, useEffect } from "react";

type BotResponse = { msg: string; opts: string[] };
const botResponses: Record<string, BotResponse> = {
  agendar: { msg: 'Para agendar com a Bea, role até a seção "Agendar" no site ou chame no WhatsApp (11) 98884-0525. Ela responde rápido! 💚', opts: ["serviços", "online", "infantil", "grupos"] },
  "serviços": { msg: "🌿 Serviços da Bea:\n\n• Terapia Individual (50 min)\n• Terapia Infantil (45 min)\n• Terapia Online (50 min)\n• Terapia de Casal (60 min)\n• Grupo Terapêutico (90 min)\n• Palestras & Workshops\n\n+3500 atendimentos realizados!", opts: ["agendar", "sala de espera", "contato"] },
  online: { msg: "💻 A Bea é especialista em atendimento online — o vínculo é vivo, humano e presente mesmo pela tela. Você pode usar a Sala de Espera Virtual para se preparar antes da sessão.", opts: ["sala de espera", "agendar", "serviços"] },
  infantil: { msg: "🧒 A terapia infantil é feita através de brincadeiras, desenhos e histórias. Crianças de 4 a 12 anos. Os pais participam das sessões de orientação mensais.", opts: ["agendar", "serviços", "como funciona"] },
  grupos: { msg: "👥 Grupos terapêuticos ativos com a Bea:\n\n• Círculo de Mulheres (Qua 19h)\n• Manejo da Ansiedade (Ter 20h, online)\n• Autoestima (Sex 14h)\n\nGrupos de 6-8 pessoas.", opts: ["agendar", "serviços", "contato"] },
  "sala de espera": { msg: '🌿 A Sala de Espera Virtual é um espaço para você se preparar antes da sessão online. Tem dicas de respiração e um timer. Role até a seção "Sala de Espera" na página!', opts: ["online", "agendar", "como funciona"] },
  "como funciona": { msg: "O processo terapêutico com a Bea tem 5 etapas:\n\n1️⃣ Primeiro contato\n2️⃣ Triagem inicial\n3️⃣ Sessão de acolhimento (sem compromisso)\n4️⃣ Processo contínuo (semanal/quinzenal)\n5️⃣ Alta terapêutica\n\nSem pressa, no seu ritmo. 💚", opts: ["agendar", "serviços", "contato"] },
  contato: { msg: "📱 WhatsApp: (11) 98884-0525\n📸 Instagram: @psicolobiaa\n🎵 TikTok: @psicolobiaa\n\nA Bea responde rápido! Entre em contato sem compromisso 🌿", opts: ["agendar", "serviços", "como funciona"] },
};

type Msg = { text: string; from: "bot" | "user" };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [inited, setInited] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    setTimeout(() => { messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight); }, 50);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !inited) {
      setMessages([{ text: "Olá! 🌿 Bem-vindo(a)! Sou a assistente virtual da Bea (Psicolobia). Como posso te ajudar?", from: "bot" }]);
      setOptions(["agendar", "serviços", "online", "infantil", "grupos", "como funciona"]);
      setInited(true);
    }
  };

  const handleOpt = (key: string) => {
    setMessages((prev) => [...prev, { text: key.charAt(0).toUpperCase() + key.slice(1), from: "user" }]);
    setOptions([]);
    const r = botResponses[key];
    if (r) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: r.msg, from: "bot" }]);
        setOptions(r.opts);
        scrollDown();
      }, 500);
    }
    scrollDown();
  };

  useEffect(scrollDown, [messages]);

  return (
    <>
      {/* Toggle */}
      <button onClick={toggle} aria-label="Assistente virtual"
        className="fixed bottom-8 right-8 w-[52px] h-[52px] rounded-full bg-gradient-to-br from-primary to-accent border-none cursor-pointer flex items-center justify-center z-[90] shadow-lg hover:scale-105 transition-transform no-print">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[0.6rem] font-bold text-white flex items-center justify-center">1</span>
        )}
      </button>

      {/* Chatbox */}
      <div className={`fixed bottom-24 right-8 w-[350px] max-h-[480px] bg-white border border-primary/15 rounded-brand flex flex-col z-[91] shadow-lg transition-all duration-300
        ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-5 scale-95 pointer-events-none"}
        max-md:w-[calc(100vw-2rem)] max-md:right-4 max-md:bottom-[5.5rem] no-print`}>
        <div className="bg-gradient-to-r from-primary to-accent px-5 py-4 rounded-t-brand flex justify-between items-center">
          <h4 className="text-white font-heading text-sm">🌿 Assistente Psicolobia</h4>
          <button onClick={toggle} className="text-white/70 text-xl hover:text-white">✕</button>
        </div>

        <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 max-h-[310px]">
          {messages.map((msg, i) => (
            <div key={i} className={`max-w-[85%] px-3.5 py-2 rounded-xl text-xs leading-relaxed animate-reveal whitespace-pre-line
              ${msg.from === "bot" ? "bg-bg self-start rounded-bl-sm text-txt" : "bg-primary text-white self-end rounded-br-sm"}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {options.map((o) => (
              <button key={o} onClick={() => handleOpt(o)}
                className="px-3 py-1 bg-bg border border-primary/15 rounded-full text-[0.7rem] font-body text-txt hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer">
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
