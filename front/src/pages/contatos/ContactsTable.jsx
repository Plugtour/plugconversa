// caminho: front/src/pages/contatos/ContactsTable.jsx
import { useEffect, useRef, useState } from 'react'

function RowMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return
      if (ref.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="pcMenu" ref={ref}>
      <button className="pcDotBtn" type="button" onClick={() => setOpen((v) => !v)}>
        ⋮
      </button>

      {open ? (
        <div className="pcMenuPanel">
          <button
            className="pcMenuItem"
            type="button"
            onClick={() => {
              setOpen(false)
              onEdit?.()
            }}
          >
            Editar
          </button>
          <button
            className="pcMenuItem pcMenuDanger"
            type="button"
            onClick={() => {
              setOpen(false)
              onDelete?.()
            }}
          >
            Excluir
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function ContactsTable({
  loading,
  rows,
  selected,
  onToggleAll,
  onToggleOne,
  getDateText
}) {
  const list = Array.isArray(rows) ? rows : []

  return (
    <div className="pcTable">
      <div className="pcTableHead">
        <div className="pcCheck">
          <input
            type="checkbox"
            onChange={onToggleAll}
            checked={list.length > 0 && list.every((c) => selected?.has(c.id))}
          />
        </div>
        <div className="pcCell">
          <span>Usuários</span>
        </div>
        <div className="pcCell">
          <span>WhatsApp</span>
        </div>
        <div className="pcCell">
          <span>Data de inscrição</span>
        </div>
        <div />
      </div>

      {loading ? <div className="pcEmpty">Carregando...</div> : null}

      {!loading && list.length === 0 ? (
        <div className="pcEmpty">Nenhum contato ainda.</div>
      ) : null}

      {!loading &&
        list.map((c) => {
          const id = c?.id
          const name = String(c?._name ?? c?.name ?? '')
          const phone = String(c?._phone ?? c?.phone ?? '')
          const created = getDateText?.(c) ?? '-'

          return (
            <div key={id ?? `${name}-${phone}`} className="pcRow">
              <div className="pcCheck">
                <input
                  type="checkbox"
                  checked={selected?.has(id)}
                  onChange={() => onToggleOne?.(id)}
                />
              </div>

              <div className="pcUser">
                <div className="pcAvatar">
                  {/* avatar “falso” igual ao print (sem depender de backend) */}
                  <img
                    alt=""
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23e5e7eb'/%3E%3Ccircle cx='30' cy='25' r='10' fill='%23cbd5e1'/%3E%3Cpath d='M15 52c3-10 27-10 30 0' fill='%23cbd5e1'/%3E%3C/svg%3E"
                  />
                </div>

                <div className="pcUserText">
                  <div className="pcUserName">{name || '-'}</div>
                  <div className="pcUserSub">{id ? String(id).slice(0, 10) : '—'}</div>
                </div>
              </div>

              <div className="pcCell">
                <span className="pcMuted">{phone || '-'}</span>
              </div>

              <div className="pcCell">
                <span className="pcMuted">{created || '-'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <RowMenu
                  onEdit={() => alert('Editar (UI pronta).')}
                  onDelete={() => alert('Excluir (UI pronta).')}
                />
              </div>
            </div>
          )
        })}
    </div>
  )
}
// fim: front/src/pages/contatos/ContactsTable.jsx
