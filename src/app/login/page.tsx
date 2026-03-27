"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

        <p className="text-center text-xs text-txt-muted mt-6">
          <Link href="/" className="hover:text-primary-dark transition-colors">← Voltar ao site</Link>
        </p>
      </div>
    </div>
  );
}
