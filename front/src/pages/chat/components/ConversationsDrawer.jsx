// caminho: front/src/pages/chat/components/ConversationsDrawer.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import DrawerFrame from './DrawerFrame.jsx'
import ConversationRow from './ConversationRow.jsx'

const AGENTS = ['Todos', 'Marcelo', 'Renan', 'Lurian', 'Vinicius', 'Kauã', 'Jonas']

function norm(v) {
  return String(v ?? '').trim().toLowerCase()
}

export default function ConversationsDrawer({ open, items, activeId, onClose, onPick }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')

  const [agent, setAgent] = useState('Todos')
  const [agentOpen, setAgentOpen] = useState(false)
  const agentWrapRef = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (!agentOpen) return
      if (!agentWrapRef.current) return
      if (agentWrapRef.current.contains(e.target)) return
      setAgentOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [agentOpen])

  const baseFiltered = useMemo(() => {
    const txt = q.trim().toLowerCase()

    return items
      .filter((c) => {
        if (!txt) return true
        const hay = `${c.name} ${c.lastMessage}`.toLowerCase()
        return hay.includes(txt)
      })
      .filter((c) => {
        if (filter === 'unread') return Number(c.unreadCount || 0) > 0
        if (filter === 'fav') return !!c.isFavorite
        if (filter === 'groups') return c.type === 'group'
        return true
      })
  }, [items, q, filter])

  const agentCounts = useMemo(() => {
    const map = new Map()
    for (const a of AGENTS) map.set(a, 0)

    for (const c of baseFiltered) {
      const a = String(c?.agentName || 'Todos').trim() || 'Todos'
      map.set(a, (map.get(a) || 0) + 1)
    }
    map.set('Todos', baseFiltered.length)
    return map
  }, [baseFiltered])

  const filtered = useMemo(() => {
    if (agent === 'Todos') return baseFiltered
    return baseFiltered.filter((c) => norm(c?.agentName) === norm(agent))
  }, [baseFiltered, agent])

  const agentLabelCount = agentCounts.get(agent) ?? 0
  const agentChipLabel =
    agent === 'Todos' ? `Agente: Todos (${agentLabelCount})` : `Agente: ${agent} (${agentLabelCount})`

  const agentIsActive = agentOpen || agent !== 'Todos'

  return (
    <DrawerFrame
      open={open}
      kind="list"
      onClose={onClose}
      showTopBar={false}
      showBackdrop={false}
    >
      <div className="pcChatListHeader">
        <div className="pcChatSearch">
          <span className="pcChatSearch__icon">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar ou começar uma nova conversa"
          />
        </div>

        <div className="pcChatChips">
          <button
            type="button"
            className={`pcChatChip ${filter === 'all' ? 'isActive' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tudo
          </button>

          <button
            type="button"
            className={`pcChatChip ${filter === 'unread' ? 'isActive' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Não lidas
          </button>

          <button
            type="button"
            className={`pcChatChip ${filter === 'fav' ? 'isActive' : ''}`}
            onClick={() => setFilter('fav')}
          >
            Favoritas
          </button>

          <button
            type="button"
            className={`pcChatChip ${filter === 'groups' ? 'isActive' : ''}`}
            onClick={() => setFilter('groups')}
          >
            Grupos
          </button>

          <span className="pcChatAgentWrap" ref={agentWrapRef}>
            <button
              type="button"
              className={`pcChatChip pcChatAgentTrigger ${agentIsActive ? 'isActive' : ''}`}
              onClick={() => setAgentOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={agentOpen ? 'true' : 'false'}
              title="Selecionar agente"
            >
              {agentChipLabel} ▾
            </button>

            {agentOpen && (
              <div className="pcChatAgentMenu" role="menu" aria-label="Agentes">
                {AGENTS.map((a) => {
                  const count = agentCounts.get(a) ?? 0
                  const isActive = a === agent

                  return (
                    <div
                      key={a}
                      role="menuitem"
                      className={`pcChatAgentItem ${isActive ? 'isActive' : ''}`}
                      onClick={() => {
                        setAgent(a)
                        setAgentOpen(false)
                      }}
                      title={a}
                    >
                      <span className="pcChatAgentName">{a}</span>
                      <span className="pcChatAgentCount">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </span>
        </div>
      </div>

      <div className="pcChatListBody">
        {filtered.map((c) => (
          <ConversationRow key={c.id} item={c} active={c.id === activeId} onClick={() => onPick?.(c.id)} />
        ))}

        {!filtered.length && (
          <div className="pcChatEmpty">
            <div className="pcChatEmpty__title">Nenhuma conversa encontrada</div>
            <div className="pcChatEmpty__subtitle">Tente ajustar a busca ou os filtros.</div>
          </div>
        )}
      </div>
    </DrawerFrame>
  )
}
// caminho: front/src/pages/chat/components/ConversationsDrawer.jsx
