// caminho: front/src/pages/campanhas/CampanhasHeader.jsx
import CampanhasToolbar from './CampanhasToolbar.jsx'

export default function CampanhasHeader() {
  const total = 0

  return (
    <div className="pageHeader">
      <div className="pageHeader__left">
        <h1 className="pageTitle">Campanhas</h1>

        <p className="cpSubTitle">
          Todas as Campanhas {total}
        </p>
      </div>

      <div className="pageHeader__actions">
        <CampanhasToolbar />
      </div>
    </div>
  )
}
// arquivo: CampanhasHeader.jsx
