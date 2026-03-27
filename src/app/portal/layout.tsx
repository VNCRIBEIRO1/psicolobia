"use client";
import { useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

function PortalSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-primary/10 min-h-screen p-6 flex flex-col">
      <Link href="/portal" className="font-heading text-xl font-bold text-primary-dark mb-8 block">
        🧠 Psicolobia
      </Link>
      <nav className="flex-1 space-y-1">
        {[
          { href: "/portal", label: "Início", icon: "🏠" },
          { href: "/portal/agendar", label: "Agendar Sessão", icon: "🗓️" },
          { href: "/portal/sessoes", label: "Minhas Sessões", icon: "📅" },
          { href: "/portal/pagamentos", label: "Pagamentos", icon: "💳" },
          { href: "/portal/documentos", label: "Documentos", icon: "📄" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-brand-sm text-sm text-txt-light hover:bg-bg hover:text-primary-dark transition-colors">
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-primary/10 pt-4 mt-4 space-y-2">
        <Link href="/" className="text-xs text-primary-dark hover:underline block">← Voltar ao site</Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-red-500 hover:underline">
          Sair
        </button>
      </div>
    </aside>
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.role !== "patient") {
      router.push("/admin");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-sm text-txt-muted">Carregando...</p>
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "patient") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <PortalSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
