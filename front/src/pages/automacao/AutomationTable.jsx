// caminho: front/src/pages/automacao/AutomationTable.jsx
import { useEffect, useState } from 'react'
import Toggle from './Toggle.jsx'

function Chip({ children }) {
  return <span className="autoChip">{children}</span>
}

function IconDots({ onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Ações" className="autoDotsBtn">
      <span style={{ display: 'inline-block', transform: 'translateY(-1px)', fontSize: 18 }}>⋮</span>
    </button>
  )
}

export default function AutomationTable({ tab, items, onToggleEnabled, onDelete, onQuickAdd }) {
  const [menuOpenId, setMenuOpenId] = useState(null)

  useEffect(() => {
    function closeOnClickOutside(e) {
      const el = e.target
      if (el?.closest?.('[data-actions-menu="1"]')) return
      setMenuOpenId(null)
    }
    window.addEventListener('mousedown', closeOnClickOutside)
    return () => window.removeEventListener('mousedown', closeOnClickOutside)
  }, [])

  return (
    <div className="autoTable">
      <div className="autoHeadRow">
        <div className="autoCenter">
          <input type="checkbox" style={{ width: 16, height: 16 }} />
        </div>
        <div>Iniciar Fluxo</div>
        <div>Mensagem</div>
        <div>Execuções</div>
        <div />
        <div />
      </div>

      {items.length === 0 ? (
        <div style={{ padding: 18, color: '#6b7280', fontSize: 13 }}>Nada encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((it) => {
            const matchLabel = it.matchType === 'contém' ? 'Contém' : 'Começa com'
            return (
              <div key={it.id} className="autoRow">
                <div className="autoCenter">
                  <input type="checkbox" style={{ width: 16, height: 16 }} />
                </div>

                <div className="autoStartCol">
                  <div className="autoStartTitle">
                    <span className="autoEllipsis">{it.name}</span>
                    <span className="autoChevron">⌄</span>
                  </div>
                  <div className={['autoMuted', 'autoEllipsis'].join(' ')}>{it.origin}</div>
                </div>

                <div className="autoMsgCol">
                  <div className="autoMatch">
                    {matchLabel} <span className="autoChevron">⌄</span>
                  </div>

                  <div className="autoChips">
                    {(it.phrases || []).map((p, i) => (
                      <Chip key={`${it.id}-p-${i}`}>{p}</Chip>
                    ))}

                    <button type="button" title="Adicionar" onClick={() => onQuickAdd?.()} className="autoAddMini">
                      +
                    </button>
                  </div>
                </div>

                <div className="autoExec">{it.executions}</div>

                <div className="autoCenter">
                  <Toggle checked={!!it.enabled} onChange={(v) => onToggleEnabled?.(it.id, v)} />
                </div>

                <div className="autoMenuWrap">
                  <div data-actions-menu="1">
                    <IconDots onClick={() => setMenuOpenId((s) => (s === it.id ? null : it.id))} />
                    {menuOpenId === it.id ? (
                      <div className="autoMenu">
                        <button type="button" className={['autoMenuBtn', 'autoMenuBtnDisabled'].join(' ')} disabled>
                          Editar (em breve)
                        </button>
                        <button
                          type="button"
                          className={['autoMenuBtn', 'autoMenuBtnDanger'].join(' ')}
                          onClick={() => {
                            setMenuOpenId(null)
                            onDelete?.(it.id)
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// arquivo: AutomationTable.jsx
// caminho: front/src/pages/automacao/AutomationTable.jsx
