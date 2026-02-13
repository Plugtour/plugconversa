// caminho: front/src/pages/Mensagens.jsx
export default function Mensagens() {
  return (
    <div className="page">
      {/* Header da página */}
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Mensagens</h1>
          <p className="pageSubtitle">
            Controle de mensagens enviadas e agendadas
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="block">
        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Status das mensagens</h3>
            <p className="cardSubtitle">
              Acompanhamento geral
            </p>
          </div>

          <div className="cardBody">
            <p>Agendadas, fila, enviadas e falhas.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
// arquivo: Mensagens.jsx
