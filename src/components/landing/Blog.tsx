"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const posts = [
  { img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80&auto=format&fit=crop", tag: "Mindfulness", title: "5 Exercícios de Respiração para Acalmar a Ansiedade", excerpt: "Técnicas simples de respiração que você pode praticar em qualquer momento para reduzir o estresse.", date: "22 Mar 2026" },
  { img: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=500&q=80&auto=format&fit=crop", tag: "Autoconhecimento", title: "O que é Psicologia Humanista e como ela pode te ajudar", excerpt: "Entenda a abordagem centrada na pessoa e como ela valoriza sua singularidade.", date: "15 Mar 2026" },
  { img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500&q=80&auto=format&fit=crop", tag: "Autoestima", title: "Como Fortalecer a Autoestima: 7 Práticas Diárias", excerpt: "Pequenos hábitos que transformam a forma como você se enxerga e se relaciona consigo.", date: "08 Mar 2026" },
  { img: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=500&q=80&auto=format&fit=crop", tag: "Relacionamentos", title: "Comunicação Não-Violenta nos Relacionamentos", excerpt: "Aprenda a se expressar com empatia e escuta ativa para construir vínculos mais saudáveis.", date: "01 Mar 2026" },
  { img: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=500&q=80&auto=format&fit=crop", tag: "Infantil", title: "Sinais de que seu Filho pode Precisar de Terapia", excerpt: "Mudanças de comportamento e isolamento podem ser sinais. Saiba quando buscar ajuda.", date: "22 Fev 2026" },
];

export function Blog() {
  const [pos, setPos] = useState(0);
  const [visible, setVisible] = useState(3);

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

  return (
    <section className="py-20 px-4 md:px-8 bg-bg-warm" id="blog">
      <div className="max-w-[1100px] mx-auto">
        <div className="section-label">Blog</div>
        <h2 className="section-title">Reflexões & Bem-estar</h2>

        <div className="relative mt-10 overflow-hidden">
          <div className="flex gap-5 transition-transform duration-500" style={{ transform: `translateX(-${pos * (100 / visible + 1.5)}%)` }}>
            {posts.map((p, i) => (
              <div key={i} className="min-w-[calc(33.333%-0.84rem)] bg-white rounded-brand overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex-shrink-0 max-lg:min-w-[calc(50%-0.625rem)] max-md:min-w-full">
                <Image src={p.img} alt={p.title} width={500} height={180} className="w-full h-[180px] object-cover" />
                <div className="p-5">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-wide bg-primary/12 text-primary-dark mb-2">
                    {p.tag}
                  </span>
                  <h3 className="font-heading text-sm font-semibold mb-1 leading-snug">{p.title}</h3>
                  <p className="text-xs text-txt-light leading-relaxed mb-3">{p.excerpt}</p>
                  <span className="text-[0.68rem] text-txt-muted">{p.date}</span>
                </div>
              </div>
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
      </div>
    </section>
  );
}
