// caminho: front/src/pages/automacao/CreateModal.jsx
import { useEffect, useState } from 'react'

function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="autoModalOverlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="autoModal">
        <div className="autoModalHead">
          <div className="autoModalTitle">{title}</div>
          <button type="button" onClick={onClose} className="autoModalClose">
            ✕
          </button>
        </div>
        <div className="autoModalBody">{children}</div>
      </div>
    </div>
  )
}

function Chip({ children, onRemove }) {
  return (
    <span className="autoChip">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover"
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          border: '1px solid #c7d2fe',
          background: '#fff',
          color: '#4f46e5',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          lineHeight: '12px'
        }}
      >
        ×
      </button>
    </span>
  )
}

export default function CreateModal({ open, tab, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [origin, setOrigin] = useState('')
  const [matchType, setMatchType] = useState('começa_com')
  const [phraseInput, setPhraseInput] = useState('')
  const [phrases, setPhrases] = useState([])

  useEffect(() => {
    if (open) {
      setName('')
      setOrigin('')
      setMatchType('começa_com')
      setPhraseInput('')
      setPhrases([])
    }
  }, [open])

  function addPhrase() {
    const p = String(phraseInput || '').trim()
    if (!p) return
    setPhrases((s) => [...s, p])
    setPhraseInput('')
  }

  function submit() {
    const nm = String(name || '').trim()
    if (!nm) return
    onCreate?.({
      name: nm,
      origin: String(origin || '').trim(),
      matchType,
      phrases
    })
  }

  const title = tab === 'palavras' ? 'Criar Palavra-chave' : tab === 'sequencias' ? 'Criar Sequência' : 'Criar Webhook'

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="autoFormGrid">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="autoLabel">Nome</div>
          <input className="autoInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Boas vindas" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="autoLabel">Origem</div>
          <input className="autoInput" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ex: Suporte" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="autoLabel">Condição</div>
          <select className="autoSelect" value={matchType} onChange={(e) => setMatchType(e.target.value)}>
            <option value="começa_com">Começa com</option>
            <option value="contém">Contém</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="autoLabel">Adicionar mensagem</div>
          <div className="autoInlineRow">
            <input
              className="autoInput"
              style={{ flex: 1 }}
              value={phraseInput}
              onChange={(e) => setPhraseInput(e.target.value)}
              placeholder="Ex: oi"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPhrase()
                }
              }}
            />
            <button type="button" className="autoBtnSoft" onClick={addPhrase}>
              +
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="autoLabel" style={{ marginBottom: 8 }}>
          Mensagens
        </div>
        <div className="autoChips">
          {phrases.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 13 }}>Nenhuma mensagem adicionada.</div>
          ) : (
            phrases.map((p, i) => (
              <Chip key={`ph-${i}`} onRemove={() => setPhrases((s) => s.filter((_, x) => x !== i))}>
                {p}
              </Chip>
            ))
          )}
        </div>
      </div>

      <div className="autoFooter">
        <button type="button" className="autoBtnGhost" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="autoBtnPrimary" onClick={submit}>
          Criar
        </button>
      </div>
    </Modal>
  )
}

// arquivo: CreateModal.jsx
// caminho: front/src/pages/automacao/CreateModal.jsx
