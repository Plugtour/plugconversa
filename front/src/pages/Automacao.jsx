// caminho: front/src/pages/Automacao.jsx
import AutomationPanel from './automacao/AutomationPanel.jsx'
import './automacao/automacao.css'

export default function Automacao() {
  return (
    <div className="page">
      {/* Header da página (MANTIDO igual) */}
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Automação</h1>
          <p className="pageSubtitle">Regras, gatilhos e fluxos automáticos de mensagens</p>
        </div>
      </div>

      {/* Conteúdo (SUBSTITUÍDO pelo layout do 1º print) */}
      <div className="block">
        <AutomationPanel />
      </div>
    </div>
  )
}

// arquivo: Automacao.jsx
// caminho: front/src/pages/Automacao.jsx
