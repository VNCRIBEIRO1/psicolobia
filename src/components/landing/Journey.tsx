const steps = [
  { num: "1", title: "Primeiro Contato", desc: "Entre em contato pelo WhatsApp ou pelo formulário do site. Respondo pessoalmente em até 2h." },
  { num: "2", title: "Triagem Gratuita", desc: "Uma conversa breve (15 min) por chamada para entender sua demanda e verificar se faz sentido caminharmos juntos." },
  { num: "3", title: "Sessão de Acolhimento", desc: "Primeira sessão online completa. Conhecemos juntos o espaço terapêutico — sem compromisso de continuidade." },
  { num: "4", title: "Processo Terapêutico", desc: "Sessões semanais ou quinzenais via videochamada. Plano terapêutico personalizado com base em ACT e tratamento de traumas." },
  { num: "5", title: "Alta Terapêutica", desc: "Quando você estiver pronto, encerramos juntos com carinho e autonomia. O retorno é sempre possível." },
];

export function Journey() {
  return (
    <section className="py-20 px-4 md:px-8 bg-white" id="jornada">
      <div className="max-w-[1100px] mx-auto text-center">
        <div className="section-label justify-center flex">Sua Jornada</div>
        <h2 className="section-title">Como Funciona o Processo Terapêutico</h2>
        <p className="text-txt-light max-w-[550px] mx-auto">
          Cada etapa é pensada para que você se sinta seguro e acolhido do primeiro contato ao acompanhamento contínuo.
        </p>

        <div className="flex gap-0 mt-10 overflow-x-auto pb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex-1 min-w-[200px] text-center px-4 relative group">
              {i < steps.length - 1 && (
                <div className="absolute top-[26px] left-1/2 right-[-50%] h-0.5 bg-bg-soft z-0" />
              )}
              <div className="w-[52px] h-[52px] rounded-full bg-bg border-[3px] border-primary flex items-center justify-center font-heading font-bold text-lg text-primary-dark mx-auto mb-3 relative z-10 transition-colors group-hover:bg-primary group-hover:text-white">
                {s.num}
              </div>
              <h3 className="font-heading text-sm font-semibold mb-1">{s.title}</h3>
              <p className="text-xs text-txt-light leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
