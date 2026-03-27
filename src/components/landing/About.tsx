import Image from "next/image";

export function About() {
  return (
    <section className="py-20 px-4 md:px-8" id="sobre">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center max-w-[1100px] mx-auto">
        {/* Photo */}
        <div className="relative max-w-[420px] mx-auto lg:mx-0">
          <Image
            src="/pefilsobrre.jpeg"
            alt="Beatriz — Psicóloga Clínica Psicolobia"
            width={400}
            height={500}
            className="rounded-[24px_24px_24px_80px] shadow-lg w-full h-[500px] object-cover object-top"
            priority
          />
          <div className="absolute bottom-5 right-5 bg-white p-4 rounded-brand shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-bg-soft rounded-full flex items-center justify-center text-lg">🌸</div>
            <div>
              <div className="text-sm font-bold">+3.500 Atendimentos</div>
              <div className="text-[0.68rem] text-txt-muted">Escuta sensível e acolhimento</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="section-label">Sobre Mim</div>
          <h2 className="section-title">Beatriz (Bea)</h2>
          <p className="text-xs text-primary-dark font-semibold mb-2">
            CRP 06/173961 · UNOESTE — Universidade do Oeste Paulista
          </p>

          {/* Einstein Badge */}
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-brand-sm px-4 py-2.5 mb-5">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-xs font-bold text-amber-800">Certificação — Faculdade Israelita Albert Einstein</p>
              <p className="text-[0.68rem] text-amber-600">Transtorno Ansioso e Depressivo · ago/2023</p>
            </div>
          </div>

          <p className="text-sm text-txt-light leading-relaxed mb-4">
            Psicóloga Clínica especialista no emocional de quem vive da internet. Já realizei mais de 3.500 atendimentos e construí uma metodologia própria, baseada na escuta sensível, na ética e na profundidade de quem acredita que cada história merece ser acolhida.
          </p>
          <p className="text-sm text-txt-light leading-relaxed mb-4">
            Com experiência em atendimento de criadores de conteúdo digital, atuação em políticas públicas (CRAS) e acompanhamento terapêutico infantil, trago uma visão ampla e humana da psicologia. Especialista em <strong>Terapia de Aceitação e Compromisso (ACT)</strong> e <strong>tratamento de traumas</strong>.
          </p>
          <p className="text-sm text-txt-light leading-relaxed mb-5">
            Atendo online, mas o vínculo é vivo, humano e presente. Sem pressa, sem moldes, sem máscaras. Se você sente que é hora de ser escutado de verdade, talvez seja hora de me encontrar.
          </p>

          {/* Áreas de atuação */}
          <div className="mb-5">
            <h3 className="text-xs font-bold text-txt uppercase tracking-wide mb-3">🎯 Áreas de Atuação</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Ansiedade", "Depressão", "Traumas", "Autoestima",
                "Burnout Digital", "Relacionamentos", "Luto",
                "Autoconhecimento", "ACT",
              ].map((area) => (
                <span key={area} className="px-3 py-1 rounded-full text-[0.68rem] font-semibold bg-primary/10 text-primary-dark border border-primary/15">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Experience highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-bg-soft/60 rounded-brand-sm p-3">
              <p className="text-xs font-bold text-txt">🧠 Autônoma (desde ago/2024)</p>
              <p className="text-[0.68rem] text-txt-muted mt-0.5">35 atendimentos semanais · Público adulto · Remoto</p>
            </div>
            <div className="bg-bg-soft/60 rounded-brand-sm p-3">
              <p className="text-xs font-bold text-txt">🔒 Privacy (2022 – 2024)</p>
              <p className="text-[0.68rem] text-txt-muted mt-0.5">35-40 atendimentos/semana · Criadores digitais · Colunista</p>
            </div>
            <div className="bg-bg-soft/60 rounded-brand-sm p-3">
              <p className="text-xs font-bold text-txt">🏛️ CRAS (2021 – 2022)</p>
              <p className="text-[0.68rem] text-txt-muted mt-0.5">Vulnerabilidade social · Grupos · Visitas domiciliares</p>
            </div>
            <div className="bg-bg-soft/60 rounded-brand-sm p-3">
              <p className="text-xs font-bold text-txt">🎒 Colégio APOGEU (2019 – 2021)</p>
              <p className="text-[0.68rem] text-txt-muted mt-0.5">Acompanhante terapêutica · Inclusão infantil (TEA)</p>
            </div>
          </div>

          <p className="text-sm font-bold text-primary-dark mb-2">
            Psicóloga Clínica · CRP 06/173961 · Terapia Online · +3.500 Atendimentos
          </p>
          <p className="flex gap-4 text-sm">
            <a href="https://www.instagram.com/psicolobiaa" target="_blank" rel="noopener" className="text-accent font-bold hover:underline">
              📸 @psicolobiaa
            </a>
            <a href="https://www.tiktok.com/@psicolobiaa" target="_blank" rel="noopener" className="text-accent font-bold hover:underline">
              🎵 TikTok
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
