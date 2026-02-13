// caminho: front/src/pages/Dashboard.jsx
export default function Dashboard() {
  return (
    <div className="page">
      {/* Header da página */}
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Dashboard</h1>
          <p className="pageSubtitle">
            Visão geral rápida do sistema
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="block">
        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Atalhos e métricas</h3>
            <p className="cardSubtitle">
              Informações principais do dia
            </p>
          </div>

          <div className="cardBody">
            <p>
              Atalhos e métricas vão ficar aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// arquivo: Dashboard.jsx
