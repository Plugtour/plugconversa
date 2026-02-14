// caminho: front/src/pages/kanban/CenterModal.jsx
import IconButton from './IconButton'

export default function CenterModal({
  modal,
  error,
  canInteract,
  closeModal,

  // NEW CARD
  newCardTitle,
  setNewCardTitle,
  newCardDesc,
  setNewCardDesc,
  createCardInColumn,
  creatingCard,

  // EDIT CARD
  editCardTitle,
  setEditCardTitle,
  editCardDesc,
  setEditCardDesc,
  updateCard,
  updatingCard,
  deleteCard,

  // EDIT COL
  editColName,
  setEditColName,
  editColColor,
  setEditColColor,
  updateColumn,
  updatingCol,
  deleteColumn
}) {
  if (!modal?.type) return null

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999
      }}
    >
      <div
        style={{
          width: 'min(520px, 96vw)',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #eee',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          padding: 14
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 15 }}>
            {modal.type === 'newCard' && `Novo card em: ${modal?.col?.title || modal?.col?.name || 'Coluna'}`}
            {modal.type === 'editCard' && `Editar card: ${modal?.card?.title || `#${modal?.card?.id}`}`}
            {modal.type === 'editCol' && `Editar coluna: ${modal?.col?.title || modal?.col?.name || `#${modal?.col?.id}`}`}
          </div>

          <IconButton title="Fechar" disabled={!canInteract} onClick={closeModal}>
            ×
          </IconButton>
        </div>

        {String(error || '').trim().length > 0 && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              background: '#fff5f5',
              border: '1px solid #ffd6d6',
              color: '#b00020',
              fontSize: 13,
              whiteSpace: 'pre-wrap'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {modal.type === 'newCard' && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Título</div>
                <input
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Título do card"
                  disabled={!canInteract}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Descrição (opcional)</div>
                <textarea
                  value={newCardDesc}
                  onChange={(e) => setNewCardDesc(e.target.value)}
                  placeholder="Ex: detalhes, lembretes, observações..."
                  disabled={!canInteract}
                  rows={4}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={closeModal}
                  disabled={!canInteract}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    background: '#fff',
                    cursor: !canInteract ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    opacity: !canInteract ? 0.7 : 1
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={createCardInColumn}
                  disabled={!canInteract}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #111',
                    background: !canInteract ? '#f6f6f6' : '#111',
                    color: !canInteract ? '#111' : '#fff',
                    cursor: !canInteract ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                    opacity: !canInteract ? 0.85 : 1
                  }}
                >
                  {creatingCard ? 'Criando...' : 'Criar card'}
                </button>
              </div>
            </>
          )}

          {modal.type === 'editCard' && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Título</div>
                <input
                  value={editCardTitle}
                  onChange={(e) => setEditCardTitle(e.target.value)}
                  disabled={!canInteract}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Descrição</div>
                <textarea
                  value={editCardDesc}
                  onChange={(e) => setEditCardDesc(e.target.value)}
                  disabled={!canInteract}
                  rows={4}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                <button
                  onClick={() => deleteCard(modal?.card)}
                  disabled={!canInteract}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #ffd6d6',
                    background: '#fff5f5',
                    color: '#b00020',
                    cursor: !canInteract ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                    opacity: !canInteract ? 0.7 : 1
                  }}
                >
                  Excluir
                </button>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={closeModal}
                    disabled={!canInteract}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      background: '#fff',
                      cursor: !canInteract ? 'not-allowed' : 'pointer',
                      fontWeight: 800,
                      opacity: !canInteract ? 0.7 : 1
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={updateCard}
                    disabled={!canInteract}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #111',
                      background: !canInteract ? '#f6f6f6' : '#111',
                      color: !canInteract ? '#111' : '#fff',
                      cursor: !canInteract ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                      opacity: !canInteract ? 0.85 : 1
                    }}
                  >
                    {updatingCard ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </div>
            </>
          )}

          {modal.type === 'editCol' && (
            <>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Nome</div>
                <input
                  value={editColName}
                  onChange={(e) => setEditColName(e.target.value)}
                  disabled={!canInteract}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Cor</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={editColColor}
                      onChange={(e) => setEditColColor(e.target.value)}
                      disabled={!canInteract}
                      style={{ width: 44, height: 36, border: 'none', background: 'transparent', padding: 0 }}
                    />
                    <input
                      value={editColColor}
                      onChange={(e) => setEditColColor(e.target.value)}
                      disabled={!canInteract}
                      style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8', outline: 'none', width: 140 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                <button
                  onClick={() => deleteColumn(modal?.col)}
                  disabled={!canInteract}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #ffd6d6',
                    background: '#fff5f5',
                    color: '#b00020',
                    cursor: !canInteract ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                    opacity: !canInteract ? 0.7 : 1
                  }}
                >
                  Excluir coluna
                </button>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={closeModal}
                    disabled={!canInteract}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      background: '#fff',
                      cursor: !canInteract ? 'not-allowed' : 'pointer',
                      fontWeight: 800,
                      opacity: !canInteract ? 0.7 : 1
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={updateColumn}
                    disabled={!canInteract}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #111',
                      background: !canInteract ? '#f6f6f6' : '#111',
                      color: !canInteract ? '#111' : '#fff',
                      cursor: !canInteract ? 'not-allowed' : 'pointer',
                      fontWeight: 900,
                      opacity: !canInteract ? 0.85 : 1
                    }}
                  >
                    {updatingCol ? 'Salvando...' : 'Salvar coluna'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
// fim do caminho: front/src/pages/kanban/CenterModal.jsx
