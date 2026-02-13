// caminho: front/src/pages/Chat.jsx
import { useMemo, useState } from 'react'
import './chat/chat.css'

import ConversationsDrawer from './chat/components/ConversationsDrawer.jsx'
import ThreadDrawer from './chat/components/ThreadDrawer.jsx'
import { mockConversations } from './chat/mock/mockConversations.js'

export default function Chat() {
  // ✅ modal 1 sempre aberto
  const [isListOpen] = useState(true)

  // modal 2 abre/fecha
  const [isThreadOpen, setIsThreadOpen] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const items = useMemo(() => mockConversations, [])
  const activeConversation = useMemo(() => items.find((c) => c.id === activeId) || null, [items, activeId])

  function onPickConversation(id) {
    setActiveId(id)
    setIsThreadOpen(true)
  }

  function closeThread() {
    setIsThreadOpen(false)
    // ✅ mantém activeId por enquanto para não causar “piscada”/troca visual durante a animação
    // limpamos após o tempo da transição do DrawerFrame
    setTimeout(() => setActiveId(null), 280)
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Chat</h1>
          <p className="pageSubtitle">Fila, atendimentos e histórico</p>
        </div>
      </div>

      <div className="block" />

      {/* Modal 1: lista (SEM onClose, SEM topo, SEM backdrop) */}
      <ConversationsDrawer
        open={isListOpen}
        items={items}
        activeId={activeId}
        onClose={undefined}
        onPick={onPickConversation}
      />

      {/* Modal 2: conversa */}
      <ThreadDrawer
        open={isListOpen && isThreadOpen}
        conversation={activeConversation}
        onClose={closeThread}
      />
    </div>
  )
}
// caminho: front/src/pages/Chat.jsx
