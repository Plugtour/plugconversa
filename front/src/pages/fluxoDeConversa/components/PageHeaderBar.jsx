// caminho: front/src/pages/fluxoDeConversa/components/PageHeaderBar.jsx
export default function PageHeaderBar() {
  return (
    <div className="pageHeader fc-top">
      <div className="pageHeader__left">
        <h1 className="pageTitle">Fluxos de conversa</h1>
        <p className="pageSubtitle">Criação de robôs e caminhos de atendimento</p>

        <button type="button" className="fc-select">
          <span className="fc-selectText">Fluxos Padrões Básicos</span>
          <span className="fc-caret" aria-hidden="true">
            ▾
          </span>
        </button>
      </div>

      <div className="pageHeader__actions">
        <button type="button" className="fc-btn fc-btnGreen">
          <span>Criar Pasta</span>
          <span className="fc-plus" aria-hidden="true">
            +
          </span>
        </button>

        <button type="button" className="fc-btn fc-btnGreen">
          <span>Criar Novo Fluxo</span>
          <span className="fc-plus" aria-hidden="true">
            +
          </span>
        </button>
      </div>
    </div>
  )
}

// arquivo: PageHeaderBar.jsx
