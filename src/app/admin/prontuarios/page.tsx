export default function ProntuariosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-txt">Prontuários</h1>
        <p className="text-sm text-txt-light mt-1">Registros clínicos dos pacientes</p>
      </div>

      <div className="bg-white rounded-brand p-6 shadow-sm border border-primary/5">
        <p className="text-sm text-txt-muted text-center py-12">
          Os prontuários são vinculados a cada paciente.<br />
          Acesse a ficha de um paciente para visualizar e criar registros clínicos.
        </p>
      </div>
    </div>
  );
}
