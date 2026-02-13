// caminho: front/src/pages/Configuracoes.jsx
export default function Configuracoes() {
  return (
    <div className="page">
      {/* Header da página */}
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Configurações</h1>
          <p className="pageSubtitle">
            Ajustes gerais da plataforma
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="block">
        {/* Card: IA */}
        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Inteligência Artificial</h3>
            <p className="cardSubtitle">
              Agentes, respostas e automações inteligentes
            </p>
          </div>
          <div className="cardBody">
            <p>Configurações relacionadas à IA.</p>
          </div>
        </div>

        {/* Card: WhatsApp */}
        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">WhatsApp</h3>
            <p className="cardSubtitle">
              Conexões, números e templates
            </p>
          </div>
          <div className="cardBody">
            <p>Configurações de conexão com WhatsApp.</p>
          </div>
        </div>

        {/* Card: Integrações */}
        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Integrações</h3>
            <p className="cardSubtitle">
              APIs e serviços externos
            </p>
          </div>
          <div className="cardBody">
            <p>Configurações de integrações externas.</p>
          </div>
        </div>

        {/* Card: Usuários */}
        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Usuários</h3>
            <p className="cardSubtitle">
              Perfis, permissões e acessos
            </p>
          </div>
          <div className="cardBody">
            <p>Gerenciamento de usuários da plataforma.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
// arquivo: Configuracoes.jsx
