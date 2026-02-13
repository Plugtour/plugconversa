// caminho: front/src/pages/Conversas.jsx
import { useEffect, useMemo, useState } from 'react'

import './chat/chat.css'

import ConversationsDrawer from './chat/components/ConversationsDrawer.jsx'
import ThreadDrawer from './chat/components/ThreadDrawer.jsx'

const MOCK_CONVERSATIONS = [
  {
    id: 'c1',
    name: 'Renan Lemos - (Plugtour)',
    lastMessage: 'Kkkkk',
    timeLabel: 'Ontem',
    unreadCount: 0,
    isFavorite: false,
    type: 'direct',

    agentName: 'Renan',
    atendimentoStatus: 'Em atendimento',
    leadType: 'Lead quente',
    manualTags: ['cliente legal', 'prioridade'],
    preDefTags: ['VIP']
  },
  {
    id: 'c2',
    name: 'Viajar melhor / Plugtour',
    lastMessage: 'Coloquei no site antes de ser criado o lay...',
    timeLabel: 'Ontem',
    unreadCount: 1,
    isFavorite: false,
    type: 'direct',

    agentName: 'Marcelo',
    atendimentoStatus: 'Em atendimento',
    leadType: 'Lead morno',
    manualTags: ['urgente'],
    preDefTags: ['Orçamento']
  },
  {
    id: 'c3',
    name: 'Catrip/Plugtour',
    lastMessage: 'Aqui o calendário está bugado',
    timeLabel: 'Ontem',
    unreadCount: 0,
    isFavorite: false,
    type: 'group',

    agentName: 'Vinicius',
    atendimentoStatus: 'Aguardando resposta',
    leadType: 'Lead frio',
    manualTags: [],
    preDefTags: ['Suporte']
  },
  {
    id: 'c4',
    name: 'Elo Turismo e Receptivo / Plugtour',
    lastMessage: 'buggy turismo: Foto',
    timeLabel: 'Ontem',
    unreadCount: 2,
    isFavorite: true,
    type: 'direct',

    agentName: 'Marcelo',
    atendimentoStatus: 'Em atendimento',
    leadType: 'Lead morno',
    manualTags: ['cliente legal'],
    preDefTags: ['Retorno']
  }
]

export default function Conversas() {
  const [listOpen, setListOpen] = useState(true)
  const [threadOpen, setThreadOpen] = useState(false)
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0]?.id || null)

  useEffect(() => {
    setListOpen(true)
  }, [])

  const items = useMemo(() => MOCK_CONVERSATIONS, [])

  const activeConversation = useMemo(() => {
    return items.find((x) => x.id === activeId) || null
  }, [items, activeId])

  function handlePick(id) {
    setActiveId(id)
    setThreadOpen(true)
  }

  function closeAll() {
    setThreadOpen(false)
    setListOpen(false)
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Chat</h1>
          <p className="pageSubtitle">Fila, atendimentos e histórico</p>
        </div>
      </div>

      <ConversationsDrawer
        open={listOpen}
        items={items}
        activeId={activeId}
        onClose={() => closeAll()}
        onPick={handlePick}
      />

      <ThreadDrawer
        open={threadOpen}
        conversation={activeConversation}
        onClose={() => setThreadOpen(false)}
      />
    </div>
  )
}
