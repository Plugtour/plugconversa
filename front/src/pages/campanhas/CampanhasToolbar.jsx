// caminho: front/src/pages/campanhas/CampanhasToolbar.jsx
function IconDownload(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 3v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 11l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPlus(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconSearch(props) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function CampanhasToolbar() {
  return (
    <div className="cpToolbar">
      <button className="cpBtn cpBtnGhost" type="button">
        <span className="cpBtnIcon">
          <IconDownload />
        </span>
        <span>Baixe Relatório</span>
      </button>

      <button className="cpBtn cpBtnPrimary" type="button">
        <span>Criar Nova Campanha</span>
        <span className="cpBtnIconRight">
          <IconPlus />
        </span>
      </button>

      <div className="cpSearchWrap">
        <input className="cpSearch" placeholder="Busca" />
        <span className="cpSearchIcon" aria-hidden="true">
          <IconSearch />
        </span>
      </div>
    </div>
  )
}
// arquivo: CampanhasToolbar.jsx
