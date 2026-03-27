"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { href: "#jornada", label: "Jornada" },
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#agendamento", label: "Agendar" },
  { href: "#sala-espera", label: "Sala de Espera" },
  { href: "#grupos", label: "Grupos" },
  { href: "#blog", label: "Blog" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a href="#main" className="absolute -top-full left-4 bg-primary text-white px-6 py-3 rounded-b-lg z-[200] focus:top-0">
        Pular para o conteúdo
      </a>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300
        ${scrolled ? "bg-white/95 shadow-md" : "bg-[#FFF5EE]/88 backdrop-blur-xl"} border-b border-primary/5`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-heading text-xl font-bold">
            Ψ
          </div>
          <div>
            <span className="font-heading text-lg font-semibold text-txt block leading-tight">Psicolobia</span>
            <span className="text-[0.6rem] text-txt-muted block">Beatriz · Psicóloga Clínica</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-txt-light hover:text-primary-dark transition-colors">
              {l.label}
            </a>
          ))}
          <Link href="/login" className="text-sm font-semibold text-primary-dark hover:text-primary transition-colors">
            Entrar
          </Link>
          <a href="#agendamento" className="btn-brand-primary text-xs !py-2 !px-4">
            🌿 Agendar
          </a>
        </nav>

        <button className="lg:hidden flex flex-col gap-1 p-1" onClick={() => setMobileOpen(true)} aria-label="Menu">
          <span className="w-5 h-0.5 bg-txt rounded-full" />
          <span className="w-5 h-0.5 bg-txt rounded-full" />
          <span className="w-5 h-0.5 bg-txt rounded-full" />
        </button>
      </header>

      {/* Mobile Nav */}
      <div
        className={`fixed inset-0 bg-[#FFF5EE]/98 backdrop-blur-xl z-[200] flex flex-col items-center justify-center gap-6 transition-all duration-300
        ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <button className="absolute top-6 right-6 text-3xl" onClick={() => setMobileOpen(false)}>
          ✕
        </button>
        {navLinks.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
            className="font-heading text-xl hover:text-primary-dark transition-colors">
            {l.label}
          </a>
        ))}
        <Link href="/login" onClick={() => setMobileOpen(false)}
          className="font-heading text-xl text-primary-dark">
          Entrar
        </Link>
      </div>
    </>
  );
}
