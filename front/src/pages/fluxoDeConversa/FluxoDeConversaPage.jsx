// caminho: front/src/pages/fluxoDeConversa/FluxoDeConversaPage.jsx
import { useMemo, useState } from 'react'
import './fluxoDeConversa.css'

import PageHeaderBar from './components/PageHeaderBar.jsx'
import TemplatesRow from './components/TemplatesRow.jsx'
import FlowsSection from './components/FlowsSection.jsx'

export default function FluxoDeConversaPage() {
  const [folderLabel] = useState('Fluxo 1')
  const [folderCount] = useState(15)
  const [query, setQuery] = useState('')

  const rows = useMemo(
    () => [
      {
        id: 'r1',
        name: '2° msg enviada para o Lead',
        connections: '-',
        execucoes: '-',
        ctr: '-',
        updatedAt: '11/02/2026'
      },
      {
        id: 'r2',
        name: '1° msg enviada para o Lead',
        connections: '-',
        execucoes: '-',
        ctr: '-',
        updatedAt: '11/02/2026'
      },
      {
        id: 'r3',
        name: 'Boas Vindas',
        connections: '-',
        execucoes: '-',
        ctr: '-',
        updatedAt: '11/02/2026'
      }
    ],
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q))
  }, [rows, query])

  return (
    <div className="page fc-page">
      <PageHeaderBar />

      <TemplatesRow />

      <FlowsSection
        folderLabel={folderLabel}
        folderCount={folderCount}
        query={query}
        onQueryChange={setQuery}
        rows={filtered}
      />
    </div>
  )
}

// arquivo: FluxoDeConversaPage.jsx
