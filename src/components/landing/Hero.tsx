import Image from "next/image";

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center text-center px-4 md:px-8 pt-28 pb-16 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute inset-0 z-0 opacity-[0.12]">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-primary blur-[100px] -top-[100px] -right-[100px]" />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-accent blur-[100px] -bottom-[80px] -left-[80px]" />
      </div>

      <div className="relative z-10 max-w-[650px]">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 border border-primary/15 rounded-full text-xs font-bold text-primary-dark mb-6">
          🌿 Beatriz (Bea) · Psicóloga Clínica — +3500 atendimentos
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] mb-4">
          Especialista no{" "}
          <span className="text-primary-dark">emocional</span> de quem vive da{" "}
          <span className="text-accent">internet</span>
        </h1>

        <p className="text-base text-txt-light max-w-[500px] mx-auto mb-8 leading-relaxed">
          Terapia online acolhedora com escuta sensível. Sem pressa, sem moldes, sem máscaras. Cada história merece ser acolhida de verdade.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <a href="#agendamento" className="btn-brand-primary">🌿 Agendar Sessão</a>
          <a href="#sobre" className="btn-brand-outline">Conheça a Profissional</a>
        </div>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Image src="/bia.png" alt="Beatriz — Psicóloga Clínica Psicolobia" width={140} height={180}
            className="rounded-[20px] shadow-lg object-cover w-[140px] h-[180px]" priority />
          <Image src="/bia2.png" alt="Beatriz — Atendimento Online" width={140} height={180}
            className="rounded-[20px] shadow-lg object-cover w-[140px] h-[180px] mt-6" priority />
          <Image src="/bia3.webp" alt="Beatriz — Consultório Psicolobia" width={140} height={180}
            className="rounded-[20px] shadow-lg object-cover w-[140px] h-[180px]" priority />
        </div>
      </div>
    </section>
  );
}
