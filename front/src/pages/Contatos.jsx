// caminho: front/src/pages/Contatos.jsx
import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../services/api.js'

import './contatos/ContactsStyles.css'
import ContactsToolbar from './contatos/ContactsToolbar.jsx'
import ContactsFilters from './contatos/ContactsFilters.jsx'
import ContactsTable from './contatos/ContactsTable.jsx'
import CreateContactModal from './contatos/CreateContactModal.jsx'
import { normalizePhone, formatBRDateTime } from './contatos/utils.js'

export default function Contatos() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet('/contacts')
      const arr = Array.isArray(data) ? data : data?.contacts ?? []
      setItems(Array.isArray(arr) ? arr : [])
    } catch (e) {
      setError(
        'Não consegui buscar /contacts. Verifique se o backend está rodando em localhost:3000 e se o CORS foi liberado.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function onCreate(payload) {
    setError('')
    try {
      await apiPost('/contacts', payload)
      await load()
      return true
    } catch (e) {
      setError('Não consegui criar contato. Confira a rota POST /contacts no backend.')
      return false
    }
  }

  useEffect(() => {
    load()
  }, [])

  const view = useMemo(() => {
    const qq = String(q || '').trim().toLowerCase()
    const mapped = (items || []).map((c) => ({
      ...c,
      _name: String(c?.name ?? ''),
      _phone: normalizePhone(String(c?.phone ?? '')),
      _created: c?.createdAt || c?.created_at || c?.created || c?.createdAtIso || null
    }))

    if (!qq) return mapped

    return mapped.filter((c) => {
      const name = String(c._name).toLowerCase()
      const phone = String(c._phone).toLowerCase()
      const notes = String(c?.notes ?? '').toLowerCase()
      return name.includes(qq) || phone.includes(qq) || notes.includes(qq)
    })
  }, [items, q])

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      const allIds = view.map((c) => c.id).filter(Boolean)
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.has(id))
      if (allSelected) return new Set()
      return new Set(allIds)
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  return (
    <div className="page">
      {/* Header (mantido) */}
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">Contatos</h1>
          <p className="pageSubtitle">Listar e criar contatos direto no banco via API</p>
        </div>
      </div>

      {/* ✅ Área que substitui o conteúdo dentro do retângulo vermelho */}
      <div className="pcContactsWrap">
        <ContactsToolbar
          searchValue={q}
          onSearchChange={setQ}
          onImport={() => alert('Importar Contatos (UI pronta).')}
          onDownload={() => alert('Baixe Relatório (UI pronta).')}
          onCreate={() => setIsCreateOpen(true)}
        />

        <div className="pcContactsGrid">
          <ContactsFilters />

          <div className="pcContactsRight">
            <div className="pcContactsRightTop">
              <button className="pcBtn pcBtnPrimary" type="button">
                Filtros <span className="pcBtnIcon">⏷</span>
              </button>

              <div className="pcRightHint">
                {selected.size > 0 ? (
                  <>
                    <span className="pcMuted">
                      Selecionados: <strong>{selected.size}</strong>
                    </span>
                    <button className="pcLinkBtn" onClick={clearSelection} type="button">
                      Limpar
                    </button>
                  </>
                ) : (
                  <span className="pcMuted">Use o botão “Filtros” para filtrar etiquetas</span>
                )}
              </div>

              <div className="pcRightActions">
                <button className="pcBtn pcBtnGhost" onClick={load} type="button" disabled={loading}>
                  Atualizar
                </button>
              </div>
            </div>

            {error ? <div className="pcError">{error}</div> : null}

            <ContactsTable
              loading={loading}
              rows={view}
              selected={selected}
              onToggleAll={toggleAll}
              onToggleOne={toggleOne}
              getDateText={(c) => formatBRDateTime(c?._created)}
            />
          </div>
        </div>
      </div>

      <CreateContactModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={async (payload) => {
          const ok = await onCreate(payload)
          if (ok) setIsCreateOpen(false)
          return ok
        }}
      />
    </div>
  )
}
// arquivo: Contatos.jsx
