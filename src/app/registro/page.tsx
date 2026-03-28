"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function RegistroForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read pre-fill params from URL (from landing page booking flow)
  const redirectTo = searchParams.get("redirect") || "";
  const bookingDate = searchParams.get("date") || "";
  const bookingTime = searchParams.get("time") || "";
  const bookingModality = searchParams.get("modality") || "";
  const bookingNotes = searchParams.get("notes") || "";
  const prefillName = searchParams.get("name") || "";
  const prefillEmail = searchParams.get("email") || "";
  const prefillPhone = searchParams.get("phone") || "";

  const hasBooking = !!(bookingDate && bookingTime);

  const [name, setName] = useState(prefillName);
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState(prefillPhone);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update state if search params change (e.g. on mount)
  useEffect(() => {
    if (prefillName && !name) setName(prefillName);
    if (prefillEmail && !email) setEmail(prefillEmail);
    if (prefillPhone && !phone) setPhone(prefillPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // If there's a booking redirect, go to login with booking params
      if (hasBooking && redirectTo) {
        const params = new URLSearchParams({
          registered: "true",
          redirect: redirectTo,
          date: bookingDate,
          time: bookingTime,
          modality: bookingModality,
          ...(bookingNotes ? { notes: bookingNotes } : {}),
        });
        router.push(`/login?${params.toString()}`);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-heading text-2xl font-bold">
            Ψ
          </div>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-txt">Criar Conta</h1>
        <p className="text-sm text-txt-light mt-1">
          {hasBooking
            ? "Crie sua conta para finalizar o agendamento"
            : "Registre-se para acessar o portal do paciente"}
        </p>
      </div>

      {hasBooking && (
        <div className="bg-green-50 border border-green-200 rounded-brand p-4 mb-5 text-sm">
          <p className="font-bold text-green-800 mb-1">📅 Agendamento selecionado</p>
          <p className="text-green-700">
            {bookingDate} às {bookingTime} • {bookingModality === "presencial" ? "Presencial" : "Online"}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Após criar sua conta e fazer login, o agendamento será finalizado.
          </p>
        </div>
      )}

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
          {loading ? "Criando conta..." : hasBooking ? "Criar Conta e Agendar 🌿" : "Criar Conta 🌿"}
        </button>

        <p className="text-center text-sm text-txt-light">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary-dark font-bold hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-center">
          <p className="text-sm text-txt-muted">Carregando…</p>
        </div>
      }>
        <RegistroForm />
      </Suspense>
    </div>
  );
}
