// caminho: front/src/pages/kanban/CardDrawer.jsx
import IconButton from './IconButton'

export default function CardDrawer({ mounted, visible, canInteract, drawer, onClose, onEdit }) {
  if (!mounted) return null

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        background: visible ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.00)',
        transition: 'background 200ms ease'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          width: 'min(620px, 92vw)',
          background: '#fff',
          borderLeft: '1px solid #eee',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <div style={{ padding: 14, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {drawer?.card?.title || `Card #${drawer?.card?.id || ''}`}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#666', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, color: '#333' }}>#{drawer?.card?.id || ''}</span>
              {drawer?.col?.title || drawer?.col?.name ? (
                <span style={{ fontWeight: 700, color: '#666' }}>
                  Coluna: <b style={{ color: '#111' }}>{drawer?.col?.title || drawer?.col?.name}</b>
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconButton
              title="Editar card"
              disabled={!canInteract}
              onClick={() => {
                onEdit?.(drawer?.col, drawer?.card)
              }}
            >
              ✎
            </IconButton>

            <IconButton title="Fechar" disabled={!canInteract} onClick={onClose}>
              ×
            </IconButton>
          </div>
        </div>

        <div style={{ padding: 14, overflow: 'auto', display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: '#666', fontWeight: 800 }}>Descrição</div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#333', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
              {String(drawer?.card?.description || '').trim().length ? drawer.card.description : '—'}
            </div>
          </div>

          <div style={{ border: '1px dashed #e6e6e6', borderRadius: 12, padding: 12, background: '#fafafa' }}>
            <div style={{ fontSize: 12, color: '#666', fontWeight: 800 }}>Dica</div>
            <div style={{ marginTop: 8, fontSize: 13, color: '#444', lineHeight: 1.4 }}>
              Duplo clique em qualquer card para abrir este painel. Feche com <b>ESC</b> ou clicando fora.
            </div>
          </div>
        </div>

        <div style={{ padding: 14, borderTop: '1px solid #eee', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={!canInteract}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #e8e8e8',
              background: '#fff',
              cursor: !canInteract ? 'not-allowed' : 'pointer',
              fontWeight: 900,
              opacity: !canInteract ? 0.7 : 1
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
// fim do caminho: front/src/pages/kanban/CardDrawer.jsx
