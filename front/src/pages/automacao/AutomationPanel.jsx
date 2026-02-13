// caminho: front/src/pages/automacao/AutomationPanel.jsx
import { useMemo, useState } from 'react'
import AutomationTabs from './AutomationTabs.jsx'
import AutomationTable from './AutomationTable.jsx'
import CreateModal from './CreateModal.jsx'
import { defaultDB, readDB, writeDB, uid } from './store.js'

export default function AutomationPanel() {
  const [tab, setTab] = useState('palavras')
  const [query, setQuery] = useState('')
  const [db, setDB] = useState(() => readDB() || defaultDB())
  const [openCreate, setOpenCreate] = useState(false)

  const items = db?.[tab] || []

  const filtered = useMemo(() => {
    const q = String(query || '').trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => {
      const hay = `${it.name} ${it.origin} ${it.matchType} ${(it.phrases || []).join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query])

  function persist(next) {
    setDB(next)
    writeDB(next)
  }

  function onToggleEnabled(id, enabled) {
    const next = { ...db }
    next[tab] = (next[tab] || []).map((it) => (it.id === id ? { ...it, enabled: !!enabled } : it))
    persist(next)
  }

  function onDelete(id) {
    const next = { ...db }
    next[tab] = (next[tab] || []).filter((it) => it.id !== id)
    persist(next)
  }

  function onCreate(payload) {
    const next = { ...db }
    const list = Array.isArray(next[tab]) ? [...next[tab]] : []
    list.unshift({
      id: uid(),
      name: payload.name,
      origin: payload.origin || '-',
      matchType: payload.matchType,
      phrases: payload.phrases || [],
      executions: 0,
      enabled: true
    })
    next[tab] = list
    persist(next)
    setOpenCreate(false)
  }

  const totalLabel = useMemo(() => {
    const n = items.length
    if (tab === 'palavras') return `Todas as Palavras-chave ${n}`
    if (tab === 'sequencias') return `Todas as Sequências ${n}`
    return `Todos os Webhooks ${n}`
  }, [items.length, tab])

  return (
    <div className="autoWrap">
      <div className="autoTopBar">
        <AutomationTabs value={tab} onChange={setTab} />

        <div className="autoRight">
          <button type="button" className="autoBtnPrimary" onClick={() => setOpenCreate(true)}>
            Criar
          </button>

          <div className="autoSearch">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca" />
            <span className="autoSearchIcon">🔍</span>
          </div>
        </div>
      </div>

      <div className="autoTotalLabel">{totalLabel}</div>

      <AutomationTable
        tab={tab}
        items={filtered}
        onToggleEnabled={onToggleEnabled}
        onDelete={onDelete}
        onQuickAdd={() => setOpenCreate(true)}
      />

      <CreateModal open={openCreate} tab={tab} onClose={() => setOpenCreate(false)} onCreate={onCreate} />
    </div>
  )
}

// arquivo: AutomationPanel.jsx
// caminho: front/src/pages/automacao/AutomationPanel.jsx
