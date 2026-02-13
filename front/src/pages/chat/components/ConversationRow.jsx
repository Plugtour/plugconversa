// caminho: front/src/pages/chat/components/ConversationRow.jsx
function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'C'
  const a = parts[0]?.[0] || ''
  const b = parts.length > 1 ? (parts[1]?.[0] || '') : ''
  return (a + b).toUpperCase()
}

function toLabel(v, fallback = '') {
  const s = String(v ?? '').trim()
  return s.length ? s : fallback
}

export default function ConversationRow({ item, active, onClick }) {
  const name = item?.name || 'Conversa'
  const msg = item?.lastMessage || ''
  const time = item?.timeLabel || item?.lastTime || 'Ontem'
  const unread = Number(item?.unreadCount || 0)

  // ✅ tags “fixas” (sempre nessa ordem) — agora com MOCK obrigatório
  const agentName = toLabel(item?.agentName, 'Todos')
  const atendimentoStatus = toLabel(item?.atendimentoStatus, 'Em atendimento')
  const leadType = toLabel(item?.leadType, 'Lead morno')

  // ✅ tags extras (podem ser várias)
  const preDefTags = Array.isArray(item?.preDefTags) ? item.preDefTags : []
  const manualTags = Array.isArray(item?.manualTags) ? item.manualTags : []

  function safePick(e) {
    // ✅ evita disparar 2x (dblclick) e evita abrir ao selecionar texto
    if (e?.detail && e.detail > 1) return

    const sel = typeof window !== 'undefined' ? window.getSelection?.() : null
    if (sel && String(sel.toString() || '').trim().length) return

    // ✅ se já está ativo, não reabre (evita re-render e “piscada”)
    if (active) return

    onClick?.()
  }

  return (
    <button
      type="button"
      className={`pcRow ${active ? 'isActive' : ''}`}
      onMouseDown={safePick}
      onClick={(e) => e.preventDefault()} // ✅ não deixa o click disparar depois do mousedown
      title={name}
    >
      <div className="pcAvatar">
        <div className="pcAvatar__fallback">{initials(name)}</div>
      </div>

      <div className="pcRowMid">
        <div className="pcRowTop">
          <div className="pcRowName">{name}</div>
          <div className="pcRowTime">{time}</div>
        </div>

        <div className="pcRowBottom">
          <div className="pcRowMsg">{msg}</div>

          <div className="pcRowBadges">
            {unread > 0 && <div className="pcUnread">{unread > 99 ? '99+' : unread}</div>}
          </div>
        </div>

        {/* ✅ Tags no card (sempre na ordem pedida) */}
        <div className="pcRowTags" aria-label="Tags da conversa">
          {/* 1) Agente */}
          <span className="pcTag pcTag--agent" title={`Agente: ${agentName}`}>
            {agentName}
          </span>

          {/* 2) Status do atendimento */}
          <span className="pcTag pcTag--status" title={`Status: ${atendimentoStatus}`}>
            {atendimentoStatus}
          </span>

          {/* 3) Tipo de lead */}
          <span className="pcTag pcTag--lead" title={`Tipo: ${leadType}`}>
            {leadType}
          </span>

          {/* 4) Tags extras: manual + pré-definidas */}
          {manualTags.map((t, idx) => (
            <span key={`m-${idx}-${t}`} className="pcTag pcTag--manual" title={String(t)}>
              {String(t)}
            </span>
          ))}

          {preDefTags.map((t, idx) => (
            <span key={`p-${idx}-${t}`} className="pcTag pcTag--predef" title={String(t)}>
              {String(t)}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
// caminho: front/src/pages/chat/components/ConversationRow.jsx
