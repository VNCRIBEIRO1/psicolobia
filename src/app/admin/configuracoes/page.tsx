export default function ConfiguracoesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Configurações</h1>
        <p className="text-sm text-txt-light mt-1">Configurações da plataforma</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">👤 Perfil</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">Nome</label>
              <input type="text" defaultValue="Beatriz" className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5">E-mail</label>
              <input type="email" className="w-full py-2.5 px-3 border-[1.5px] border-primary/15 rounded-brand-sm font-body text-sm bg-white text-txt focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">📅 Horários de Atendimento</h3>
          <p className="text-sm text-txt-muted">Configure seus horários disponíveis para agendamento.</p>
          <div className="mt-4 space-y-2">
            {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((day) => (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-primary/5 last:border-0">
                <span className="text-sm font-medium w-24">{day}</span>
                <input type="time" defaultValue="08:00" className="py-1.5 px-2 border border-primary/15 rounded-brand-sm text-sm" />
                <span className="text-xs text-txt-muted">até</span>
                <input type="time" defaultValue="20:00" className="py-1.5 px-2 border border-primary/15 rounded-brand-sm text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Session Pricing */}
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">💰 Valores das Sessões</h3>
          <div className="space-y-4">
            {[
              { label: "Terapia Individual (50 min)", key: "individual" },
              { label: "Terapia Infantil (45 min)", key: "infantil" },
              { label: "Terapia de Casal (60 min)", key: "casal" },
              { label: "Grupo Terapêutico (90 min)", key: "grupo" },
            ].map((s) => (
              <div key={s.key} className="flex items-center gap-4">
                <span className="text-sm text-txt-light flex-1">{s.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-txt-muted">R$</span>
                  <input type="number" placeholder="0,00" className="w-24 py-1.5 px-2 border border-primary/15 rounded-brand-sm text-sm text-right" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-brand-primary">Salvar Configurações 🌿</button>
      </div>
    </div>
  );
}
