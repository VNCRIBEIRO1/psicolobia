export default function AdminDashboard() {
  const stats = [
    { icon: "👥", label: "Pacientes Ativos", value: "0", color: "bg-blue-50 text-blue-600" },
    { icon: "📅", label: "Sessões este mês", value: "0", color: "bg-green-50 text-green-600" },
    { icon: "💰", label: "Receita do mês", value: "R$ 0,00", color: "bg-yellow-50 text-yellow-600" },
    { icon: "📋", label: "Prontuários", value: "0", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Dashboard</h1>
        <p className="text-sm text-txt-light mt-1">Visão geral da sua prática clínica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
            <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center text-lg mb-3`}>
              {s.icon}
            </div>
            <p className="text-xs text-txt-muted font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-txt mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">📅 Próximas Sessões</h3>
          <p className="text-sm text-txt-muted text-center py-8">Nenhuma sessão agendada</p>
        </div>

        <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
          <h3 className="font-heading text-base font-semibold text-txt mb-4">💰 Pagamentos Pendentes</h3>
          <p className="text-sm text-txt-muted text-center py-8">Nenhum pagamento pendente</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
        <h3 className="font-heading text-base font-semibold text-txt mb-4">📊 Atividade Recente</h3>
        <p className="text-sm text-txt-muted text-center py-8">
          Configure o banco de dados para ver dados reais aqui.<br />
          <span className="text-xs">Conecte sua conta Neon e execute as migrações.</span>
        </p>
      </div>
    </div>
  );
}
