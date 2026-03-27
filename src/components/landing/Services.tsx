const services = [
  { icon: "🌿", title: "Terapia Individual Online", time: "50 min", desc: "Sessões semanais por videochamada com escuta sensível e profunda. Abordagem baseada em ACT para autoconhecimento e acolhimento." },
  { icon: "🧠", title: "Ansiedade & Depressão", time: "50 min", desc: "Tratamento especializado com certificação Albert Einstein. Técnicas de ACT e mindfulness para manejo do sofrimento emocional." },
  { icon: "💔", title: "Tratamento de Traumas", time: "50 min", desc: "Reprocessamento de experiências traumáticas com abordagem segura e acolhedora. Resgate da sua narrativa de vida." },
  { icon: "👩‍💻", title: "Criadores de Conteúdo", time: "50 min", desc: "Atendimento especializado para quem vive da internet. Burnout digital, exposição, ansiedade de performance." },
  { icon: "💑", title: "Terapia de Casal", time: "60 min", desc: "Para casais que buscam fortalecer a comunicação, resolver conflitos e construir uma relação mais saudável." },
  { icon: "👥", title: "Grupo Terapêutico", time: "90 min", desc: "Grupos de 6 a 8 pessoas. Encontros semanais com temas como autoestima, ansiedade e empoderamento." },
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
