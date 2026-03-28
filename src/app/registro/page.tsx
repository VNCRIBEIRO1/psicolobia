"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
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
          <h1 className="font-heading text-2xl font-bold text-txt">Criar Conta</h1>
          <p className="text-sm text-txt-light mt-1">Registre-se para acessar o portal do paciente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-brand p-8 shadow-md space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-brand-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1.5">Nome completo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full py-3 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full py-3 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Telefone / WhatsApp</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full py-3 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full py-3 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">Confirmar senha</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="w-full py-3 px-4 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-brand-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Criando conta..." : "Criar Conta 🌿"}
          </button>

          <p className="text-center text-sm text-txt-light">
            Já tem conta?{" "}
            <Link href="/login" className="text-primary-dark font-bold hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
