"use client";
import { useState, useEffect } from "react";
import { signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administradora",
  therapist: "Terapeuta",
  patient: "Paciente",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [existingSession, setExistingSession] = useState<{
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null>(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    getSession().then((s) => {
      if (s?.user) {
        setExistingSession({
          name: s.user.name,
          email: s.user.email,
          role: (s.user as { role?: string }).role,
        });
      }
      setCheckingSession(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      return;
    }

    // Redirect based on role
    const session = await getSession();
    if (session?.user?.role === "patient") {
      router.push("/portal");
    } else {
      router.push("/admin");
    }
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-heading text-2xl font-bold">
              Ψ
            </div>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-txt">Entrar no Psicolobia</h1>
          <p className="text-sm text-txt-light mt-1">Acesse o painel administrativo ou portal do paciente</p>
        </div>

        {/* Existing session banner */}
        {existingSession && !checkingSession && (
          <div className="bg-amber-50 border border-amber-200 rounded-brand p-5 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900 mb-1">Você já está logado(a)</p>
                <p className="text-xs text-amber-800 mb-0.5">
                  <strong>{existingSession.name}</strong> · {ROLE_LABELS[existingSession.role || ""] || existingSession.role}
                </p>
                <p className="text-xs text-amber-700 truncate">{existingSession.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => {
                      const path = existingSession.role === "patient" ? "/portal" : "/admin";
                      router.push(path);
                    }}
                    className="btn-brand-primary text-xs py-1.5 px-3"
                  >
                    Continuar →
                  </button>
                  <button
                    onClick={async () => {
                      await signOut({ redirect: false });
                      setExistingSession(null);
                    }}
                    className="text-xs py-1.5 px-3 border border-amber-300 rounded-brand-sm text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    🔄 Trocar de Conta
                  </button>
                </div>
                <p className="text-[0.65rem] text-amber-600 mt-2">
                  Fazer login abaixo substituirá a sessão atual.
                </p>
              </div>
            </div>
          </div>
        )}

        {checkingSession ? (
          <div className="bg-white rounded-brand p-8 shadow-md text-center">
            <p className="text-sm text-txt-muted">Verificando sessão...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-brand p-8 shadow-md space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-brand-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1.5">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full py-3 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="w-full py-3 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-brand-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Entrando..." : "Entrar 🌿"}
          </button>

          <p className="text-center text-sm text-txt-light">
            Não tem conta?{" "}
            <Link href="/registro" className="text-primary-dark font-bold hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
        )}

        <p className="text-center text-xs text-txt-muted mt-6">
          <Link href="/" className="hover:text-primary-dark transition-colors">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  );
}
