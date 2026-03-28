"use client";
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { SessionMismatch } from "@/components/SessionMismatch";

const NAV_ITEMS = [
  { href: "/portal", label: "Início", icon: "🏠" },
  { href: "/portal/agendar", label: "Agendar Sessão", icon: "🗓️" },
  { href: "/portal/sessoes", label: "Minhas Sessões", icon: "📅" },
  { href: "/portal/pagamentos", label: "Pagamentos", icon: "💳" },
  { href: "/portal/documentos", label: "Documentos", icon: "📄" },
];

function PortalSidebar({ mobileOpen, onClose, userName, userEmail }: { mobileOpen: boolean; onClose: () => void; userName?: string; userEmail?: string }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-primary/10 p-6 flex flex-col
        transition-transform duration-300
        lg:static lg:translate-x-0 lg:z-auto
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between mb-8">
          <Link href="/portal" className="font-heading text-xl font-bold text-primary-dark" onClick={onClose}>
            🧠 Psicolobia
          </Link>
          <button onClick={onClose} className="lg:hidden text-txt-muted hover:text-txt text-xl">✕</button>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-brand-sm text-sm text-txt-light hover:bg-bg hover:text-primary-dark transition-colors">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-primary/10 pt-4 mt-4 space-y-2">
          {userName && (
            <div className="px-0 py-1">
              <p className="text-xs font-bold text-txt truncate">{userName}</p>
              <p className="text-[0.65rem] text-txt-muted truncate">{userEmail}</p>
            </div>
          )}
          <Link href="/" className="text-xs text-primary-dark hover:underline block">← Voltar ao site</Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-red-500 hover:underline">
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PortalLayoutInner>{children}</PortalLayoutInner>
    </SessionProvider>
  );
}

function PortalLayoutInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-sm text-txt-muted">Carregando...</p>
      </div>
    );
  }

  if (status !== "authenticated") return null;

  if (session?.user?.role !== "patient") {
    return (
      <SessionMismatch
        userName={session?.user?.name || "Usuário"}
        userEmail={session?.user?.email || ""}
        userRole={session?.user?.role || "admin"}
        targetArea="portal"
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <PortalSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userName={session?.user?.name || undefined}
        userEmail={session?.user?.email || undefined}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-primary/10">
          <button onClick={() => setMobileOpen(true)} className="text-txt text-xl" aria-label="Menu">☰</button>
          <span className="font-heading text-base font-bold text-primary-dark">🧠 Psicolobia</span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
