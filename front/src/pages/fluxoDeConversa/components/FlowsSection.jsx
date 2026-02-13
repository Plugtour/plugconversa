// caminho: front/src/pages/fluxoDeConversa/components/FlowsSection.jsx
import FolderPill from './FolderPill.jsx'
import SearchBox from './SearchBox.jsx'
import FlowsTable from './FlowsTable.jsx'

export default function FlowsSection({ folderLabel, folderCount, query, onQueryChange, rows }) {
  return (
    <div className="fc-section">
      <div className="fc-sectionHeader">
        <div className="fc-sectionTitle">Todos os Fluxos</div>

        <div className="fc-toolbar">
          <FolderPill label={folderLabel} count={folderCount} />
          <SearchBox value={query} onChange={onQueryChange} />
        </div>
      </div>

      <FlowsTable rows={rows} />
    </div>
  )
}

// arquivo: FlowsSection.jsx
