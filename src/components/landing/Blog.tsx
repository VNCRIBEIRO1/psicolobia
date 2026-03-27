"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  coverImage: string | null;
  publishedAt: string | null;
};

const fallbackPosts: BlogPost[] = [
  { id: "f1", slug: "#", title: "5 Exercícios de Respiração para Acalmar a Ansiedade", excerpt: "Técnicas simples de respiração que você pode praticar em qualquer momento para reduzir o estresse.", category: "Mindfulness", coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80&auto=format&fit=crop", publishedAt: "2026-03-22" },
  { id: "f2", slug: "#", title: "O que é ACT e como pode te ajudar", excerpt: "Entenda a Terapia de Aceitação e Compromisso e como ela transforma a relação com suas emoções.", category: "Autoconhecimento", coverImage: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=500&q=80&auto=format&fit=crop", publishedAt: "2026-03-15" },
  { id: "f3", slug: "#", title: "Como Fortalecer a Autoestima: 7 Práticas Diárias", excerpt: "Pequenos hábitos que transformam a forma como você se enxerga e se relaciona consigo.", category: "Autoestima", coverImage: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&q=80&auto=format&fit=crop", publishedAt: "2026-03-08" },
  { id: "f4", slug: "#", title: "Comunicação Não-Violenta nos Relacionamentos", excerpt: "Aprenda a se expressar com empatia e escuta ativa para construir vínculos mais saudáveis.", category: "Relacionamentos", coverImage: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=500&q=80&auto=format&fit=crop", publishedAt: "2026-03-01" },
  { id: "f5", slug: "#", title: "Burnout Digital: Quando a Internet Pesa", excerpt: "Sinais de esgotamento digital e como proteger sua saúde mental na era das redes sociais.", category: "Saúde Mental", coverImage: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=500&q=80&auto=format&fit=crop", publishedAt: "2026-02-22" },
];

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts);
  const [pos, setPos] = useState(0);
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    fetch("/api/blog?status=published")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: BlogPost[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 768) setVisible(1);
      else if (window.innerWidth <= 1024) setVisible(2);
      else setVisible(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxPos = Math.max(0, posts.length - visible);

  useEffect(() => {
    if (pos > maxPos) setPos(maxPos);
  }, [maxPos, pos]);

  const fmtDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-bg-warm" id="blog">
      <div className="max-w-[1100px] mx-auto">
        <div className="section-label">Blog</div>
        <h2 className="section-title">Reflexões & Bem-estar</h2>

        <div className="relative mt-10 overflow-hidden">
          <div className="flex gap-5 transition-transform duration-500" style={{ transform: `translateX(-${pos * (100 / visible + 1.5)}%)` }}>
            {posts.map((p) => (
              <Link
                key={p.id}
                href={p.slug === "#" ? "/blog" : `/blog/${p.slug}`}
                className="min-w-[calc(33.333%-0.84rem)] bg-white rounded-brand overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex-shrink-0 max-lg:min-w-[calc(50%-0.625rem)] max-md:min-w-full group"
              >
                {p.coverImage && (
                  <Image src={p.coverImage} alt={p.title} width={500} height={180} className="w-full h-[180px] object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="p-5">
                  {p.category && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wide bg-primary/12 text-primary-dark mb-2">
                      {p.category}
                    </span>
                  )}
                  <h3 className="font-heading text-sm font-semibold mb-1 leading-snug group-hover:text-primary-dark transition-colors">{p.title}</h3>
                  <p className="text-xs text-txt-light leading-relaxed mb-3 line-clamp-2">{p.excerpt}</p>
                  <span className="text-[0.68rem] text-txt-muted">{fmtDate(p.publishedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setPos(Math.max(0, pos - 1))} className="w-10 h-10 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Anterior">‹</button>
          <button onClick={() => setPos(Math.min(maxPos, pos + 1))} className="w-10 h-10 rounded-full border-[1.5px] border-primary bg-transparent text-primary-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Próximo">›</button>
        </div>

        <div className="flex gap-1.5 justify-center mt-4">
          {Array.from({ length: maxPos + 1 }).map((_, i) => (
            <button key={i} onClick={() => setPos(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === pos ? "bg-primary w-6" : "bg-primary-light w-2"}`}
              aria-label={`Slide ${i + 1}`} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/blog" className="btn-brand-outline text-sm">
            Ver todos os artigos →
          </Link>
        </div>
      </div>
    </section>
  );
}
