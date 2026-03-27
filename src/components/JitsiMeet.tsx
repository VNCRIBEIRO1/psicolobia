"use client";
import { useEffect, useRef, useState } from "react";

interface JitsiMeetProps {
  roomName: string;
  displayName: string;
  onClose?: () => void;
}

export function JitsiMeet({ roomName, displayName, onClose }: JitsiMeetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    const domain = "meet.jit.si";
    const options = {
      roomName: `psicolobia-${roomName}`,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableWelcomePage: false,
        enableClosePage: false,
        disableModeratorIndicator: true,
        disableReactions: true,
        hiddenPremeetingButtons: ["invite"],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "desktop", "chat",
          "raisehand", "tileview", "hangup",
        ],
        DISABLE_VIDEO_BACKGROUND: true,
        DEFAULT_BACKGROUND: "#FFF5EE",
      },
      userInfo: {
        displayName,
      },
    };

    // Load Jitsi External API script
    const script = document.createElement("script");
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    script.onload = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        setLoading(false);

        api.addEventListener("readyToClose", () => {
          onClose?.();
        });

        api.addEventListener("videoConferenceLeft", () => {
          onClose?.();
        });
      } catch {
        setError("Erro ao iniciar a videochamada. Tente novamente.");
        setLoading(false);
      }
    };
    script.onerror = () => {
      setError("Erro ao carregar o serviço de videochamada.");
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [roomName, displayName, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center">
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 rounded-brand overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-txt text-white">
          <span className="text-sm font-bold">🧠 Sessão Psicolobia</span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-sm font-bold"
          >
            ✕ Fechar
          </button>
        </div>

        {/* Content */}
        <div ref={containerRef} className="w-full" style={{ height: "calc(100% - 40px)" }}>
          {loading && (
            <div className="flex items-center justify-center h-full bg-bg">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-heading text-xl font-bold mx-auto mb-4 animate-pulse">
                  Ψ
                </div>
                <p className="text-sm text-txt-muted">Conectando à sessão...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full bg-bg">
              <div className="text-center">
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <button onClick={onClose} className="btn-brand-outline text-sm">
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
