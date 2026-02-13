// caminho: front/src/pages/fluxoDeConversa/components/FlowsTable.jsx
import { useMemo, useState } from 'react'

export default function FlowsTable({ rows }) {
  const [selected, setSelected] = useState(() => new Set())

  const allChecked = useMemo(() => {
    if (!rows?.length) return false
    return rows.every((r) => selected.has(r.id))
  }, [rows, selected])

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allChecked) {
        rows.forEach((r) => next.delete(r.id))
        return next
      }
      rows.forEach((r) => next.add(r.id))
      return next
    })
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="fc-tableWrap">
      <div className="fc-tableHead">
        <div className="fc-th fc-thCheck">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
        </div>
        <div className="fc-th fc-thName">Nome</div>
        <div className="fc-th fc-thConn">Connections</div>
        <div className="fc-th fc-thExec">Execuções</div>
        <div className="fc-th fc-thCtr">CTR, %</div>
        <div className="fc-th fc-thUpd">Última alteração</div>
        <div className="fc-th fc-thMenu" />
      </div>

      <div className="fc-tableBody">
        {rows?.map((r) => (
          <div key={r.id} className="fc-tr">
            <div className="fc-td fc-tdCheck">
              <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} />
            </div>

            <div className="fc-td fc-tdName">{r.name}</div>
            <div className="fc-td fc-tdConn">{r.connections}</div>
            <div className="fc-td fc-tdExec">{r.execucoes}</div>
            <div className="fc-td fc-tdCtr">{r.ctr}</div>
            <div className="fc-td fc-tdUpd">{r.updatedAt}</div>

            <div className="fc-td fc-tdMenu">
              <button type="button" className="fc-rowMenu" title="Mais opções">
                ⋮
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// arquivo: FlowsTable.jsx
