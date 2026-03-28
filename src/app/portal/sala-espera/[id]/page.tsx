"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { JitsiMeet } from "@/components/JitsiMeet";
import { buildRoomName } from "@/lib/jitsi";

type AppointmentData = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: string;
  status: string;
  meetingUrl: string | null;
};

export default function SalaEsperaPage() {
  const { id: appointmentId } = useParams<{ id: string }>();
  const [apt, setApt] = useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [showJitsi, setShowJitsi] = useState(false);
  const [checklist, setChecklist] = useState({
    camera: false,
    mic: false,
    quiet: false,
    water: false,
    phone: false,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!appointmentId) return;
    fetch(`/api/appointments/${appointmentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setApt(data);
          // Calculate seconds until session start
          const sessionDateTime = new Date(`${data.date}T${data.startTime}`);
          const now = new Date();
          const diff = Math.max(0, Math.floor((sessionDateTime.getTime() - now.getTime()) / 1000));
          setSeconds(diff);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [appointmentId]);

  // Countdown timer
  useEffect(() => {
    if (seconds === null || seconds <= 0) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [seconds !== null && seconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeJitsi = useCallback(() => setShowJitsi(false), []);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(Boolean);
  const hasMeetingUrl = !!apt?.meetingUrl;
  const canEnter = seconds !== null && seconds <= 900 && hasMeetingUrl; // Allow entry 15 min before + requires meeting link

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });

  const roomName = appointmentId ? buildRoomName(appointmentId) : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-heading text-xl font-bold mx-auto mb-4 animate-pulse">
            Ψ
          </div>
          <p className="text-sm text-txt-muted">Carregando sala de espera…</p>
        </div>
      </div>
    );
  }

  if (!apt) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <span className="text-4xl">😕</span>
        <h2 className="font-heading text-lg font-semibold text-txt mt-4">Sessão não encontrada</h2>
        <p className="text-sm text-txt-muted mt-2">Verifique se o link está correto.</p>
        <Link href="/portal/sessoes" className="btn-brand-primary mt-4 inline-block">
          Ver Minhas Sessões
        </Link>
      </div>
    );
  }

  const isOnline = apt.modality === "online";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/portal/sessoes"
          className="text-xs text-primary-dark font-bold hover:underline mb-2 inline-block"
        >
          ← Voltar às sessões
        </Link>
        <h1 className="font-heading text-2xl font-bold text-txt">Sala de Espera Virtual</h1>
        <p className="text-sm text-txt-light mt-1">Prepare-se para sua sessão 🌿</p>
      </div>

      {/* Session Info Card */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-brand p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-txt">📅 {fmtDate(apt.date)}</p>
            <p className="text-sm text-txt-light mt-1">
              ⏰ {apt.startTime} – {apt.endTime} •{" "}
              {isOnline ? "📹 Online (videochamada)" : "🏢 Presencial"}
            </p>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              apt.status === "confirmed"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {apt.status === "confirmed" ? "✅ Confirmada" : "⏳ Pendente"}
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="bg-white rounded-brand p-8 shadow-sm border border-primary/5 mb-6 text-center">
        <p className="text-sm text-txt-muted mb-2">
          {seconds !== null && seconds > 0
            ? "Sua sessão começa em"
            : "🟢 Sua sessão já pode começar!"}
        </p>
        <div className="font-heading text-5xl font-bold text-primary-dark my-3">
          {seconds !== null && seconds > 0 ? formatCountdown(seconds) : "00:00"}
        </div>
        {seconds !== null && seconds > 0 && seconds <= 900 && (
          <p className="text-xs text-green-600 font-medium">
            ✅ Você já pode entrar na sala!
          </p>
        )}
      </div>

      {/* Triagem reminder */}
      <div className="bg-accent/5 border border-accent/20 rounded-brand p-5 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-txt">Triagem pré-sessão</p>
            <p className="text-xs text-txt-muted mt-0.5">
              Preencha antes da sessão para que a Bea possa se preparar melhor.
            </p>
          </div>
          <Link
            href={`/portal/triagem/${appointmentId}`}
            className="text-xs text-primary-dark font-bold hover:underline whitespace-nowrap"
          >
            Preencher →
          </Link>
        </div>
      </div>

      {/* Equipment Checklist (online only) */}
      {isOnline && (
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 mb-6">
          <h3 className="font-heading text-sm font-semibold text-txt mb-4">
            🎥 Checklist de Preparação
          </h3>
          <div className="space-y-3">
            {[
              { key: "camera" as const, emoji: "📷", label: "Câmera funcionando", hint: "Teste antes de entrar" },
              { key: "mic" as const, emoji: "🎤", label: "Microfone funcionando", hint: "Verifique o áudio" },
              { key: "quiet" as const, emoji: "🤫", label: "Ambiente silencioso e privado", hint: "Sem interrupções" },
              { key: "water" as const, emoji: "💧", label: "Água por perto", hint: "Mantenha-se hidratada(o)" },
              { key: "phone" as const, emoji: "📱", label: "Celular no silencioso", hint: "Evite distrações" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`w-full flex items-center gap-3 p-3 rounded-brand-sm border-[1.5px] text-left transition-colors ${
                  checklist[item.key]
                    ? "border-green-300 bg-green-50"
                    : "border-primary/10 hover:border-primary/20"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                    checklist[item.key]
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {checklist[item.key] ? "✓" : ""}
                </span>
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${checklist[item.key] ? "text-green-700" : "text-txt"}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-txt-muted">{item.hint}</p>
                </div>
              </button>
            ))}
          </div>
          {allChecked && (
            <p className="text-center text-sm text-green-600 font-medium mt-4">
              ✅ Tudo pronto! Você está preparada(o) para a sessão.
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5 mb-6">
        <h3 className="font-heading text-sm font-semibold text-txt mb-4">
          {isOnline ? "📹 Instruções para Videochamada" : "🏢 Instruções para Sessão Presencial"}
        </h3>
        {isOnline ? (
          <div className="space-y-3 text-sm text-txt-light">
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">1.</span>
              <p>
                A sessão acontece via <strong>Jitsi Meet</strong> — uma plataforma segura e gratuita.
                Não é necessário baixar nenhum aplicativo.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">2.</span>
              <p>
                Use preferencialmente um <strong>computador ou notebook</strong> com fones de ouvido
                para melhor qualidade de áudio.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">3.</span>
              <p>
                Escolha um <strong>ambiente privado e silencioso</strong> onde possa falar livremente
                sem interrupções.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">4.</span>
              <p>
                Verifique sua <strong>conexão com a internet</strong> — se possível, use cabo ao invés de Wi-Fi.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">5.</span>
              <p>
                Ao clicar em <strong>&quot;Entrar na Sessão&quot;</strong>, a videochamada abrirá automaticamente.
                Permita o acesso à câmera e microfone quando solicitado.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">6.</span>
              <p>
                Se tiver problemas técnicos, entre em contato pelo{" "}
                <a
                  href="https://wa.me/5511988840525"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-dark font-bold hover:underline"
                >
                  WhatsApp
                </a>
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-txt-light">
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">1.</span>
              <p>Chegue com <strong>10 minutos de antecedência</strong>.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">2.</span>
              <p>Use roupas confortáveis.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">3.</span>
              <p>Leve <strong>água</strong> e, se quiser, um caderno para anotações.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary-dark font-bold mt-0.5">4.</span>
              <p>
                Dúvidas? Entre em contato pelo{" "}
                <a
                  href="https://wa.me/5511988840525"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-dark font-bold hover:underline"
                >
                  WhatsApp
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Breathing exercise */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-brand p-6 mb-6 text-center">
        <h3 className="font-heading text-sm font-semibold text-txt mb-3">🧘 Enquanto Espera…</h3>
        <div className="space-y-2 text-sm text-txt-light max-w-md mx-auto text-left">
          <p>🌬️ Faça 3 respirações profundas — inspire em 4s, expire em 6s</p>
          <p>📱 Coloque seu celular no silencioso</p>
          <p>💧 Tenha um copo de água ao alcance</p>
          <p>🪑 Acomode-se em um lugar tranquilo e confortável</p>
          <p>📝 Se quiser, anote o que gostaria de compartilhar hoje</p>
        </div>
      </div>

      {/* No meeting link warning */}
      {isOnline && !hasMeetingUrl && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-brand p-4 mb-6 text-center">
          <p className="text-sm text-yellow-800 font-medium">⏳ O link da videochamada será liberado pela Bea antes da sessão.</p>
          <p className="text-xs text-yellow-600 mt-1">Quando o link estiver disponível, o botão para entrar será habilitado automaticamente.</p>
        </div>
      )}

      {/* Enter Session Button */}
      {isOnline && (
        <div className="text-center mb-8">
          <button
            onClick={() => setShowJitsi(true)}
            disabled={!canEnter}
            className={`btn-brand-accent text-base px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed ${
              canEnter ? "animate-pulse" : ""
            }`}
          >
            📹 Entrar na Sessão
          </button>
          {!canEnter && seconds !== null && !hasMeetingUrl && (
            <p className="text-xs text-yellow-600 mt-2">
              Aguardando a psicóloga liberar o link da videochamada.
            </p>
          )}
          {!canEnter && seconds !== null && hasMeetingUrl && seconds > 900 && (
            <p className="text-xs text-txt-muted mt-2">
              Disponível 15 minutos antes do horário da sessão.
            </p>
          )}
          {apt.meetingUrl && (
            <p className="text-xs text-txt-muted mt-3">
              Ou acesse diretamente:{" "}
              <a
                href={apt.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-dark font-bold hover:underline"
              >
                {apt.meetingUrl}
              </a>
            </p>
          )}
        </div>
      )}

      {/* Jitsi Modal */}
      {showJitsi && (
        <JitsiMeet
          roomName={roomName}
          displayName="Paciente"
          onClose={closeJitsi}
        />
      )}
    </div>
  );
}
