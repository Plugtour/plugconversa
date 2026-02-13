// caminho: front/src/pages/Kanban.jsx
import { useEffect, useMemo, useRef, useState } from 'react'

import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'

import SortableColumn, { BoardColumnPreview } from './kanban/BoardColumn'
import CardDrawer from './kanban/CardDrawer'
import CenterModal from './kanban/CenterModal'
import { safeJsonParse, clone } from './kanban/utils'
import { parseCardId, parseColDropId } from './kanban/ids'

const API_BASE = import.meta.env.VITE_API_URL;

// ✅ diminuir largura e gap
const COL_W = 250
const COL_GAP = 10

export default function Kanban() {
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [showNewCol, setShowNewCol] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColColor, setNewColColor] = useState('#111111')
  const [newColAi, setNewColAi] = useState('')
  const [creatingCol, setCreatingCol] = useState(false)

  const isDraggingCardRef = useRef(false)
  const [isDraggingCard, setIsDraggingCard] = useState(false)

  const [activeColId, setActiveColId] = useState(null)
  const [activeColSnap, setActiveColSnap] = useState(null)

  const [activeCardSnap, setActiveCardSnap] = useState(null)
  const [overTagId, setOverTagId] = useState(null)

  const boardRef = useRef(null)
  const [modal, setModal] = useState({ type: null, col: null, card: null })

  const [newCardName, setNewCardName] = useState('')
  const [newCardPhone, setNewCardPhone] = useState('')
  const [newCardNotes, setNewCardNotes] = useState('')
  const [creatingCard, setCreatingCard] = useState(false)

  const [editCardName, setEditCardName] = useState('')
  const [editCardPhone, setEditCardPhone] = useState('')
  const [editCardNotes, setEditCardNotes] = useState('')
  const [updatingCard, setUpdatingCard] = useState(false)

  const [editColName, setEditColName] = useState('')
  const [editColColor, setEditColColor] = useState('#111111')
  const [editColAi, setEditColAi] = useState('')
  const [updatingCol, setUpdatingCol] = useState(false)

  const [deletingCard, setDeletingCard] = useState(false)
  const [deletingCol, setDeletingCol] = useState(false)

  const [hoverFooterColId, setHoverFooterColId] = useState(null)

  // ✅ drawer
  const [drawer, setDrawer] = useState({ open: false, col: null, card: null })
  const drawerCardIdRef = useRef(null)
  const [drawerMounted, setDrawerMounted] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const drawerCloseTimerRef = useRef(null)

  const totalCards = useMemo(() => {
    return (Array.isArray(columns) ? columns : []).reduce((acc, col) => {
      const count = Array.isArray(col?.contacts) ? col.contacts.length : 0
      return acc + count
    }, 0)
  }, [columns])

  const canInteract =
    !loading &&
    !saving &&
    !creatingCol &&
    !creatingCard &&
    !updatingCard &&
    !updatingCol &&
    !deletingCard &&
    !deletingCol

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 }
    })
  )

  async function loadBoard() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/tags/board`)
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${txt}`.trim())
      }
      const data = await res.json()
      setColumns(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao carregar board')
      setColumns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBoard()
  }, [])

  function getColById(tagId) {
    return (Array.isArray(columns) ? columns : []).find((c) => Number(c?.id) === Number(tagId)) || null
  }

  function findCardInColumns(contactId) {
    for (const col of Array.isArray(columns) ? columns : []) {
      const list = Array.isArray(col?.contacts) ? col.contacts : []
      const idx = list.findIndex((c) => Number(c?.id) === Number(contactId))
      if (idx >= 0) return { colId: Number(col.id), index: idx, card: list[idx] }
    }
    return null
  }

  async function fetchJsonOrText(res) {
    const txt = await res.text().catch(() => '')
    const maybe = safeJsonParse(txt)
    return { txt, maybe }
  }

  function startCardDragLockNow() {
    isDraggingCardRef.current = true
    setIsDraggingCard(true)
  }
  function stopCardDragLockNow() {
    isDraggingCardRef.current = false
    setIsDraggingCard(false)
  }

  // ✅ drawer open/close
  function openDrawerFromCard(col, card) {
    if (!card?.id) return

    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current)
      drawerCloseTimerRef.current = null
    }

    drawerCardIdRef.current = Number(card.id)
    setDrawer({ open: true, col: col || null, card: card || null })

    setDrawerMounted(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerVisible(true))
    })
  }

  function closeDrawer() {
    drawerCardIdRef.current = null
    setDrawerVisible(false)

    if (drawerCloseTimerRef.current) clearTimeout(drawerCloseTimerRef.current)
    drawerCloseTimerRef.current = setTimeout(() => {
      setDrawerMounted(false)
      setDrawer({ open: false, col: null, card: null })
      drawerCloseTimerRef.current = null
    }, 220)
  }

  useEffect(() => {
    if (!drawerMounted) return
    function onKeyDown(e) {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerMounted])

  useEffect(() => {
    if (!drawerMounted) return
    const id = drawerCardIdRef.current
    if (!Number.isFinite(Number(id))) return
    const found = findCardInColumns(Number(id))
    if (!found?.card) return
    const col = getColById(found.colId)
    setDrawer((prev) => ({ ...prev, col: col || prev.col, card: found.card || prev.card }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, drawerMounted])

  async function apiMoveContact({ contactId, fromTagId, toTagId }) {
    const res = await fetch(`${API_BASE}/tags/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_id: Number(contactId),
        from_tag_id: Number(fromTagId),
        to_tag_id: Number(toTagId)
      })
    })

    if (!res.ok) {
      const { txt, maybe } = await fetchJsonOrText(res)
      const msg = maybe?.error || txt || `HTTP ${res.status}`
      throw new Error(String(msg).trim())
    }
  }

  async function persistColumnOrder(nextColumns) {
    const ordered = (Array.isArray(nextColumns) ? nextColumns : [])
      .map((c) => Number(c?.id))
      .filter(Number.isFinite)

    if (ordered.length === 0) return

    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/tags/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_tag_ids: ordered })
      })

      if (!res.ok) {
        const { txt, maybe } = await fetchJsonOrText(res)
        const msg = maybe?.error || txt || `HTTP ${res.status}`
        throw new Error(String(msg).trim())
      }
    } catch (e) {
      await loadBoard()
      setError(e?.message ? String(e.message) : 'Erro ao reordenar colunas')
    } finally {
      setSaving(false)
    }
  }

  function maybeAutoScrollBoard(clientX) {
    const el = boardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const margin = 70
    const speed = 18

    if (clientX < rect.left + margin) el.scrollLeft -= speed
    else if (clientX > rect.right - margin) el.scrollLeft += speed
  }

  const collisionDetection = (args) => {
    const activeType = args?.active?.data?.current?.type
    if (activeType === 'col') {
      const onlyCols = (args?.droppableContainers || []).filter((c) => c?.data?.current?.type === 'col')
      return closestCenter({ ...args, droppableContainers: onlyCols })
    }
    return closestCenter(args)
  }

  function handleDragStart(event) {
    if (!canInteract) return
    const type = event?.active?.data?.current?.type

    if (type === 'col') {
      if (isDraggingCardRef.current) return
      const id = event?.active?.id
      if (!id) return
      setActiveColId(String(id))
      const col = columns.find((c) => String(c?.id) === String(id)) || null
      setActiveColSnap(col ? clone(col) : null)
      return
    }

    if (type === 'card') {
      startCardDragLockNow()
      const contactId = parseCardId(event?.active?.id)
      if (!Number.isFinite(Number(contactId))) return
      const found = findCardInColumns(contactId)
      setActiveCardSnap(found?.card ? clone(found.card) : null)
      if (Number.isFinite(found?.colId)) setOverTagId(Number(found.colId))
    }
  }

  function handleDragMove(event) {
    const ev = event?.activatorEvent
    if (ev?.clientX) maybeAutoScrollBoard(ev.clientX)
  }

  function handleDragOver(event) {
    const type = event?.active?.data?.current?.type
    if (type !== 'card') return

    const over = event?.over
    if (!over?.id) return

    const overType = over?.data?.current?.type
    if (overType === 'card' || overType === 'colDrop') {
      const colId = Number(over?.data?.current?.colId)
      if (Number.isFinite(colId)) setOverTagId(colId)
      return
    }

    if (overType === 'col') {
      const colId = Number(over?.data?.current?.colId ?? over?.id)
      if (Number.isFinite(colId)) setOverTagId(colId)
      return
    }

    const maybeDrop = parseColDropId(over?.id)
    if (Number.isFinite(maybeDrop)) setOverTagId(maybeDrop)
  }

  async function handleDragEnd(event) {
    const type = event?.active?.data?.current?.type

    if (type === 'col') {
      const active = event?.active?.id
      const over = event?.over?.id

      setActiveColId(null)
      setActiveColSnap(null)

      if (!active || !over) return
      if (String(active) === String(over)) return

      const oldIndex = columns.findIndex((c) => String(c?.id) === String(active))
      const newIndex = columns.findIndex((c) => String(c?.id) === String(over))
      if (oldIndex < 0 || newIndex < 0) return

      const next = arrayMove(columns, oldIndex, newIndex)
      setColumns(next)
      await persistColumnOrder(next)
      return
    }

    if (type === 'card') {
      const activeIdRaw = event?.active?.id
      const over = event?.over

      setActiveCardSnap(null)
      setOverTagId(null)
      stopCardDragLockNow()

      const contactId = parseCardId(activeIdRaw)
      if (!Number.isFinite(contactId)) return
      if (!over?.id) return

      const fromFound = findCardInColumns(contactId)
      const fromColId = fromFound?.colId
      if (!Number.isFinite(fromColId)) return

      const overType = over?.data?.current?.type
      let toColId = null
      let overContactId = null

      if (overType === 'card') {
        toColId = Number(over?.data?.current?.colId)
        overContactId = parseCardId(over?.id)
      } else if (overType === 'colDrop') {
        toColId = Number(over?.data?.current?.colId)
      } else if (overType === 'col') {
        toColId = Number(over?.data?.current?.colId ?? over?.id)
      } else {
        const maybeDrop = parseColDropId(over?.id)
        if (Number.isFinite(maybeDrop)) toColId = maybeDrop
      }

      if (!Number.isFinite(Number(toColId))) return

      // reordenar mesma coluna (sem backend)
      if (Number(fromColId) === Number(toColId) && overType === 'card' && Number.isFinite(overContactId)) {
        const col = getColById(fromColId)
        const list = Array.isArray(col?.contacts) ? col.contacts : []

        const oldIndex = list.findIndex((c) => Number(c?.id) === Number(contactId))
        const newIndex = list.findIndex((c) => Number(c?.id) === Number(overContactId))
        if (oldIndex < 0 || newIndex < 0) return
        if (oldIndex === newIndex) return

        const nextCols = (Array.isArray(columns) ? columns : []).map((c) => {
          if (Number(c?.id) !== Number(fromColId)) return c
          const nextList = arrayMove(Array.isArray(c?.contacts) ? c.contacts : [], oldIndex, newIndex)
          return { ...c, contacts: nextList }
        })

        setColumns(nextCols)
        return
      }

      // mover para outra coluna
      const movingCard = fromFound?.card
      if (!movingCard) return

      let insertIndex = null
      if (overType === 'card' && Number.isFinite(overContactId)) {
        const toCol = getColById(toColId)
        const toList = Array.isArray(toCol?.contacts) ? toCol.contacts : []
        const idx = toList.findIndex((c) => Number(c?.id) === Number(overContactId))
        insertIndex = idx >= 0 ? idx : toList.length
      } else {
        const toCol = getColById(toColId)
        const toList = Array.isArray(toCol?.contacts) ? toCol.contacts : []
        insertIndex = toList.length
      }

      setSaving(true)
      setError('')

      setColumns((prev) => {
        const removed = prev.map((col) => {
          if (Number(col?.id) !== Number(fromColId)) return col
          const list = Array.isArray(col?.contacts) ? col.contacts : []
          return { ...col, contacts: list.filter((c) => Number(c?.id) !== Number(contactId)) }
        })

        return removed.map((col) => {
          if (Number(col?.id) !== Number(toColId)) return col
          const list = Array.isArray(col?.contacts) ? [...(col.contacts || [])] : []
          const exists = list.some((c) => Number(c?.id) === Number(contactId))
          if (exists) return col

          let idx = Number(insertIndex)
          if (!Number.isFinite(idx)) idx = list.length
          if (idx < 0) idx = 0
          if (idx > list.length) idx = list.length

          list.splice(idx, 0, movingCard)
          return { ...col, contacts: list }
        })
      })

      try {
        await apiMoveContact({ contactId, fromTagId: fromColId, toTagId: toColId })
      } catch (e) {
        await loadBoard()
        setError(e?.message ? String(e.message) : 'Erro ao mover contato')
      } finally {
        setSaving(false)
      }
    }
  }

  function handleDragCancel() {
    setActiveColId(null)
    setActiveColSnap(null)
    setActiveCardSnap(null)
    setOverTagId(null)
    stopCardDragLockNow()
  }

  // modais
  function closeModal() {
    setModal({ type: null, col: null, card: null })
  }

  function openNewCardModal(col) {
    setError('')
    setNewCardName('')
    setNewCardPhone('')
    setNewCardNotes('')
    setModal({ type: 'newCard', col: col || null, card: null })
  }

  function openEditCardModal(col, card) {
    setError('')
    setEditCardName(String(card?.name || ''))
    setEditCardPhone(String(card?.phone || ''))
    setEditCardNotes(String(card?.notes || ''))
    setModal({ type: 'editCard', col: col || null, card: card || null })
  }

  function openEditColModal(col) {
    setError('')
    setEditColName(String(col?.name || ''))
    setEditColColor(String(col?.color || '#111111'))
    setEditColAi(String(col?.ai_profile || ''))
    setModal({ type: 'editCol', col: col || null, card: null })
  }

  function resetNewColForm() {
    setNewColName('')
    setNewColColor('#111111')
    setNewColAi('')
  }

  async function createNewColumn() {
    if (creatingCol || saving) return
    const name = String(newColName || '').trim()
    if (!name.length) {
      setError('Informe o nome da coluna.')
      return
    }

    setCreatingCol(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          color: String(newColColor || '').trim() || null,
          ai_profile: String(newColAi || '').trim() || null
        })
      })

      if (!res.ok) {
        const { txt, maybe } = await fetchJsonOrText(res)
        const msg = maybe?.error || txt || `HTTP ${res.status}`
        throw new Error(String(msg).trim())
      }

      resetNewColForm()
      setShowNewCol(false)
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao criar coluna')
    } finally {
      setCreatingCol(false)
    }
  }

  async function createContactInColumn() {
    if (creatingCard || saving) return
    const col = modal?.col
    if (!col?.id) return

    const name = String(newCardName || '').trim()
    const phone = String(newCardPhone || '').trim()
    const notes = String(newCardNotes || '').trim()

    if (!name.length) {
      setError('Informe o nome do contato.')
      return
    }
    if (!phone.length) {
      setError('Informe o telefone do contato.')
      return
    }

    setCreatingCard(true)
    setError('')

    try {
      const res1 = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, notes: notes.length ? notes : null })
      })

      if (!res1.ok) {
        const { txt, maybe } = await fetchJsonOrText(res1)
        const msg = maybe?.error || txt || `HTTP ${res1.status}`
        throw new Error(String(msg).trim())
      }

      const created = await res1.json().catch(() => null)
      const contactId = Number(created?.id)

      if (!Number.isFinite(contactId)) {
        throw new Error('Contato criado, mas não recebi o ID. Ajuste o retorno do POST /contacts.')
      }

      const res2 = await fetch(`${API_BASE}/tags/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contactId, tag_id: Number(col.id) })
      })

      if (!res2.ok) {
        const { txt, maybe } = await fetchJsonOrText(res2)
        const msg = maybe?.error || txt || `HTTP ${res2.status}`
        throw new Error(String(msg).trim())
      }

      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao criar contato')
      await loadBoard()
    } finally {
      setCreatingCard(false)
    }
  }

  async function tryUpdateContact(id, payload) {
    const put = await fetch(`${API_BASE}/contacts/${Number(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (put.ok) return

    const patch = await fetch(`${API_BASE}/contacts/${Number(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (patch.ok) return

    const { txt: t1, maybe: m1 } = await fetchJsonOrText(put)
    const { txt: t2, maybe: m2 } = await fetchJsonOrText(patch)

    const msg1 = m1?.error || t1 || `HTTP ${put.status}`
    const msg2 = m2?.error || t2 || `HTTP ${patch.status}`

    throw new Error(String(msg1 || msg2).trim() || 'Falha ao atualizar (verifique PUT/PATCH /contacts/:id no backend).')
  }

  async function updateContact() {
    if (updatingCard || saving) return
    const card = modal?.card
    if (!card?.id) return

    const name = String(editCardName || '').trim()
    const phone = String(editCardPhone || '').trim()
    const notes = String(editCardNotes || '').trim()

    if (!name.length) {
      setError('Informe o nome do contato.')
      return
    }
    if (!phone.length) {
      setError('Informe o telefone do contato.')
      return
    }

    setUpdatingCard(true)
    setError('')

    try {
      await tryUpdateContact(Number(card.id), { name, phone, notes: notes.length ? notes : null })
      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao editar contato')
      await loadBoard()
    } finally {
      setUpdatingCard(false)
    }
  }

  async function deleteContact(card) {
    if (deletingCard || saving) return
    if (!card?.id) return

    const ok = window.confirm(`Excluir o card "${card?.name || `#${card?.id}`}"?`)
    if (!ok) return

    setDeletingCard(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/contacts/${Number(card.id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const { txt, maybe } = await fetchJsonOrText(res)
        const msg = maybe?.error || txt || `HTTP ${res.status}`
        throw new Error(String(msg).trim() || 'Falha ao excluir (verifique DELETE /contacts/:id no backend).')
      }

      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao excluir contato')
      await loadBoard()
    } finally {
      setDeletingCard(false)
    }
  }

  async function updateColumn() {
    if (updatingCol || saving) return
    const col = modal?.col
    if (!col?.id) return

    const name = String(editColName || '').trim()
    const color = String(editColColor || '').trim()
    const ai_profile = String(editColAi || '').trim()

    if (!name.length) {
      setError('Informe o nome da coluna.')
      return
    }

    setUpdatingCol(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/tags/${Number(col.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          color: color.length ? color : null,
          ai_profile: ai_profile.length ? ai_profile : null
        })
      })

      if (!res.ok) {
        const { txt, maybe } = await fetchJsonOrText(res)
        const msg = maybe?.error || txt || `HTTP ${res.status}`
        throw new Error(String(msg).trim() || 'Falha ao atualizar (verifique PUT /tags/:id no backend).')
      }

      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao editar coluna')
      await loadBoard()
    } finally {
      setUpdatingCol(false)
    }
  }

  async function deleteColumn(col) {
    if (deletingCol || saving) return
    if (!col?.id) return

    const ok = window.confirm(`Excluir a coluna "${col?.name || `#${col?.id}`}"?`)
    if (!ok) return

    setDeletingCol(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE}/tags/${Number(col.id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const { txt, maybe } = await fetchJsonOrText(res)
        const msg = maybe?.error || txt || `HTTP ${res.status}`
        throw new Error(String(msg).trim() || 'Falha ao excluir (verifique DELETE /tags/:id no backend).')
      }

      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao excluir coluna')
      await loadBoard()
    } finally {
      setDeletingCol(false)
    }
  }

  const columnIds = useMemo(() => (Array.isArray(columns) ? columns.map((c) => String(c?.id)) : []), [columns])

  return (
    <div className="page">
      <div className="pageHeader">
        <div className="pageHeader__left">
          <h1 className="pageTitle">CRM Kanban</h1>
          <p className="pageSubtitle">
            Colunas por etiquetas (tags) e cards por contato. <b>{columns.length}</b> colunas · <b>{totalCards}</b> contatos
            {(saving || creatingCol || creatingCard || updatingCard || updatingCol || deletingCard || deletingCol) && (
              <span style={{ marginLeft: 10, fontWeight: 800, color: '#111' }}>Salvando...</span>
            )}
          </p>
        </div>

        <div className="pageHeader__right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowNewCol((v) => !v)}
            disabled={loading || !canInteract}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e8e8e8',
              background: loading || !canInteract ? '#f6f6f6' : '#fff',
              cursor: loading || !canInteract ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              opacity: loading || !canInteract ? 0.7 : 1
            }}
          >
            Nova coluna
          </button>

          <button
            onClick={loadBoard}
            disabled={loading || !canInteract}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #e8e8e8',
              background: loading || !canInteract ? '#f6f6f6' : '#fff',
              cursor: loading || !canInteract ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              opacity: loading || !canInteract ? 0.7 : 1
            }}
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="block">
        {showNewCol && (
          <div className="card" style={{ padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Cadastrar nova coluna</div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Nome</div>
                <input
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="Ex: Lead frio, Em negociação, Fechado..."
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8', outline: 'none' }}
                  disabled={!canInteract}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Cor</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newColColor}
                      onChange={(e) => setNewColColor(e.target.value)}
                      disabled={!canInteract}
                      style={{ width: 44, height: 36, border: 'none', background: 'transparent', padding: 0 }}
                    />
                    <input
                      value={newColColor}
                      onChange={(e) => setNewColColor(e.target.value)}
                      placeholder="#111111"
                      disabled={!canInteract}
                      style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8', outline: 'none', width: 140 }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 240, display: 'grid', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#444' }}>Perfil IA (opcional)</div>
                  <input
                    value={newColAi}
                    onChange={(e) => setNewColAi(e.target.value)}
                    placeholder="Ex: Você é um atendente focado em qualificação..."
                    disabled={!canInteract}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e8e8e8', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    resetNewColForm()
                    setShowNewCol(false)
                  }}
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
                  onClick={createNewColumn}
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
                  {creatingCol ? 'Criando...' : 'Criar coluna'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="card" style={{ padding: 14, borderRadius: 10 }}>
            Carregando colunas...
          </div>
        )}

        {!loading && error && (
          <div
            className="card"
            style={{
              padding: 14,
              borderRadius: 10,
              background: '#fff5f5',
              border: '1px solid #ffd6d6',
              color: '#b00020'
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Aviso</div>
            <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{error}</div>
          </div>
        )}

        {!loading && (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div
              ref={boardRef}
              style={{
                display: 'flex',
                gap: COL_GAP,
                overflowX: 'auto',
                paddingBottom: 10,
                alignItems: 'stretch',
                background: '#FAFAFA',
                borderRadius: 12,
                padding: 12,
                minHeight: 'calc(100vh - 260px)'
              }}
            >
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {columns.map((col) => (
                  <SortableColumn
                    key={col.id}
                    col={col}
                    COL_W={COL_W}
                    canInteract={canInteract}
                    isDraggingCard={isDraggingCard}
                    isDraggingCardRef={isDraggingCardRef}
                    overTagId={overTagId}
                    hoverFooterColId={hoverFooterColId}
                    setHoverFooterColId={setHoverFooterColId}
                    getColById={getColById}
                    onOpenNewCard={openNewCardModal}
                    onOpenEditCol={openEditColModal}
                    onDeleteCol={deleteColumn}
                    onOpenEditCard={openEditCardModal}
                    onDeleteCard={deleteContact}
                    onOpenDrawer={openDrawerFromCard}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeColSnap ? (
                <div style={{ pointerEvents: 'none', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.22))' }}>
                  {/* ✅ coluna “da frente” com cards visíveis (levemente apagados) */}
                  <BoardColumnPreview col={activeColSnap} COL_W={COL_W} cardsOpacity={0.85} />
                </div>
              ) : activeCardSnap ? (
                <div style={{ width: 'min(240px, 80vw)', pointerEvents: 'none', opacity: 0.98, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.18))' }}>
                  <div style={{ border: '1px solid #bcdcff', borderRadius: 10, padding: 12, background: '#fff' }}>
                    <div style={{ fontWeight: 900 }}>{activeCardSnap?.name || `Contato #${activeCardSnap?.id}`}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#333' }}>
                      <b>Telefone:</b> {activeCardSnap?.phone || '-'}
                    </div>
                    {String(activeCardSnap?.notes || '').trim().length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 13, color: '#444', lineHeight: 1.35 }}>
                        <b>Obs:</b> {activeCardSnap.notes}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
          Arraste um card para reordenar dentro da coluna ou mover para outra coluna. Para reordenar colunas, arraste a coluna inteira.
        </div>
      </div>

      {/* ✅ Drawer lateral com blur + animação */}
      <CardDrawer
        mounted={drawerMounted}
        visible={drawerVisible}
        canInteract={canInteract}
        drawer={drawer}
        onClose={closeDrawer}
        onEdit={(col, card) => openEditCardModal(col, card)}
      />

      {/* ✅ Modal central separado */}
      <CenterModal
        modal={modal}
        error={error}
        canInteract={canInteract}
        closeModal={closeModal}
        // NEW CARD
        newCardName={newCardName}
        setNewCardName={setNewCardName}
        newCardPhone={newCardPhone}
        setNewCardPhone={setNewCardPhone}
        newCardNotes={newCardNotes}
        setNewCardNotes={setNewCardNotes}
        createContactInColumn={createContactInColumn}
        creatingCard={creatingCard}
        // EDIT CARD
        editCardName={editCardName}
        setEditCardName={setEditCardName}
        editCardPhone={editCardPhone}
        setEditCardPhone={setEditCardPhone}
        editCardNotes={editCardNotes}
        setEditCardNotes={setEditCardNotes}
        updateContact={updateContact}
        updatingCard={updatingCard}
        deleteContact={deleteContact}
        // EDIT COL
        editColName={editColName}
        setEditColName={setEditColName}
        editColColor={editColColor}
        setEditColColor={setEditColColor}
        editColAi={editColAi}
        setEditColAi={setEditColAi}
        updateColumn={updateColumn}
        updatingCol={updatingCol}
        deleteColumn={deleteColumn}
      />
    </div>
  )
}
// fim do caminho: front/src/pages/Kanban.jsx
