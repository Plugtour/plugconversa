// caminho: front/src/pages/campanhas/CampanhasPage.jsx
import CampanhasHeader from './CampanhasHeader.jsx'
import CampanhasEmptyState from './CampanhasEmptyState.jsx'

export default function CampanhasPage() {
  const total = 0

  return (
    <div className="page">
      <CampanhasHeader />

      <div className="cpBody">
        <CampanhasEmptyState />
      </div>
    </div>
  )
}
// arquivo: CampanhasPage.jsx
