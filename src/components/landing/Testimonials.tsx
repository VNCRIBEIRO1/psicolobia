const testimonials = [
  { stars: 5, quote: "Encontrei um espaço onde posso ser eu mesma sem julgamento. O acolhimento e a escuta fazem toda a diferença no meu processo.", author: "Carolina P.", since: "Paciente há 1 ano" },
  { stars: 5, quote: "A terapia transformou meu filho. Ele era muito ansioso e agora está mais seguro e feliz. Profissional incrível com crianças.", author: "Renata M.", since: "Mãe de paciente" },
  { stars: 5, quote: "O grupo terapêutico mudou minha vida. Encontrei acolhimento, aprendi a colocar limites e hoje me respeito muito mais.", author: "Sandra L.", since: "Participante do grupo há 6 meses" },
];

export function Testimonials() {
  return (
    <section className="py-20 px-4 md:px-8 bg-bg-warm">
      <div className="max-w-[1100px] mx-auto">
        <div className="section-label">Depoimentos</div>
        <h2 className="section-title">Histórias de Transformação</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-7 rounded-brand shadow-md border-l-[3px] border-l-accent hover:shadow-lg transition-shadow">
              <div className="text-yellow-400 text-sm mb-2 tracking-widest">
                {"★".repeat(t.stars)}
              </div>
              <p className="text-sm text-txt-light leading-relaxed italic mb-3">&ldquo;{t.quote}&rdquo;</p>
              <div className="text-sm font-bold text-primary-dark">{t.author}</div>
              <div className="text-[0.68rem] text-txt-muted">{t.since}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
