const services = [
  { icon: "🌿", title: "Terapia Individual", time: "50 min", desc: "Sessões presenciais ou online. Acolhimento, escuta e autoconhecimento em um espaço seguro." },
  { icon: "🧒", title: "Terapia Infantil", time: "45 min", desc: "Através do brincar, a criança expressa e elabora suas emoções de forma lúdica e acolhedora." },
  { icon: "👩‍💻", title: "Terapia Online", time: "50 min", desc: "Atendimento por videochamada com a mesma qualidade. Ideal para quem busca flexibilidade." },
  { icon: "👥", title: "Grupo Terapêutico", time: "90 min", desc: "Grupos de 6 a 8 pessoas. Encontros semanais com temas como autoestima, ansiedade e empoderamento." },
  { icon: "💑", title: "Terapia de Casal", time: "60 min", desc: "Espaço para diálogo e reconexão. Comunicação assertiva e reconstrução de vínculos afetivos." },
  { icon: "🏢", title: "Palestras & Workshops", time: "Consultar", desc: "Temas como saúde mental no trabalho, gestão emocional, parentalidade consciente." },
];

export function Services() {
  return (
    <section className="py-20 px-4 md:px-8 bg-bg-warm" id="servicos">
      <div className="max-w-[1100px] mx-auto">
        <div className="section-label">Serviços</div>
        <h2 className="section-title">Modalidades de Atendimento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {services.map((s, i) => (
            <div key={i} className="card border-t-[3px] border-t-transparent hover:border-t-primary">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-heading text-base font-semibold mb-1">{s.title}</h3>
              <div className="text-sm font-bold text-primary-dark mb-2">{s.time}</div>
              <p className="text-xs text-txt-light leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
