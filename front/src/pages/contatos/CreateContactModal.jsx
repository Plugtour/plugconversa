// caminho: front/src/pages/contatos/CreateContactModal.jsx
import { useEffect, useState } from 'react'
import { normalizePhone } from './utils.js'

export default function CreateContactModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setErr('')
    setSaving(false)
  }, [open])

  if (!open) return null

  async function submit(e) {
    e.preventDefault()
    setErr('')

    const nm = String(name || '').trim()
    const ph = normalizePhone(phone)

    if (!nm || !ph) {
      setErr('Preencha nome e telefone.')
      return
    }

    setSaving(true)
    const ok = await onCreate?.({ name: nm, phone: ph, notes: String(notes || '').trim() })
    setSaving(false)

    if (ok) {
      setName('')
      setPhone('')
      setNotes('')
    }
  }

  return (
    <div
      className="pcModalOverlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.25)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        style={{
          width: 'min(520px, 96vw)',
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #eef2f7',
          boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '14px 14px', borderBottom: '1px solid #eef2f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Criar Contato</div>
            <button className="pcBtn" type="button" onClick={onClose}>
              Fechar
            </button>
          </div>
          <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>
            Cadastro rápido
          </div>
        </div>

        <form onSubmit={submit} style={{ padding: 14 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cliente Teste"
                style={{
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  padding: '0 12px',
                  outline: 'none',
                  background: '#fff',
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>Telefone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +5511999999999"
                style={{
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  padding: '0 12px',
                  outline: 'none',
                  background: '#fff',
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>Notas</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações..."
                rows={3}
                style={{
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  padding: 12,
                  outline: 'none',
                  background: '#fff',
                  fontSize: 13,
                  resize: 'vertical'
                }}
              />
            </div>

            {err ? (
              <div style={{ color: '#991b1b', fontSize: 13, background: '#fff1f2', border: '1px solid #fecaca', padding: 10, borderRadius: 12 }}>
                {err}
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="pcBtn" type="button" onClick={onClose}>
                Cancelar
              </button>
              <button className="pcBtn pcBtnGreenSolid" type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
// fim: front/src/pages/contatos/CreateContactModal.jsx
