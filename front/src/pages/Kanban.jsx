// caminho: front/src/pages/Kanban.jsx
import { useEffect, useMemo, useRef, useState } from 'react'

import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'

import SortableColumn, { BoardColumnPreview } from './kanban/BoardColumn'
import CardDrawer from './kanban/CardDrawer'
import CenterModal from './kanban/CenterModal'
import { safeJsonParse, clone } from './kanban/utils'
import { parseCardId, parseColDropId } from './kanban/ids'

import { apiGet, apiPost, apiPatch, apiDelete } from '../services/api'

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
  const [creatingCol, setCreatingCol] = useState(false)

  const isDraggingCardRef = useRef(false)
  const [isDraggingCard, setIsDraggingCard] = useState(false)

  const [activeColId, setActiveColId] = useState(null)
  const [activeColSnap, setActiveColSnap] = useState(null)

  const [activeCardSnap, setActiveCardSnap] = useState(null)
  const [overColId, setOverColId] = useState(null)

  const boardRef = useRef(null)
  const [modal, setModal] = useState({ type: null, col: null, card: null })

  // cards
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardDesc, setNewCardDesc] = useState('')
  const [creatingCard, setCreatingCard] = useState(false)

  const [editCardTitle, setEditCardTitle] = useState('')
  const [editCardDesc, setEditCardDesc] = useState('')
  const [updatingCard, setUpdatingCard] = useState(false)

  // columns
  const [editColName, setEditColName] = useState('')
  const [editColColor, setEditColColor] = useState('#111111')
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
      const count = Array.isArray(col?.cards) ? col.cards.length : 0
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
      const data = await apiGet('/kanban/board')
      const normalized = (Array.isArray(data) ? data : []).map((c) => ({
        ...c,
        // compat: a UI antiga usava name/contacts; agora usamos title/cards
        name: c?.title,
        contacts: Array.isArray(c?.cards) ? c.cards : [],
        cards: Array.isArray(c?.cards) ? c.cards : []
      }))
      setColumns(normalized)
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

  function getColById(colId) {
    return (Array.isArray(columns) ? columns : []).find((c) => Number(c?.id) === Number(colId)) || null
  }

  function findCardInColumns(cardId) {
    for (const col of Array.isArray(columns) ? columns : []) {
      const list = Array.isArray(col?.cards) ? col.cards : []
      const idx = list.findIndex((c) => Number(c?.id) === Number(cardId))
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

  async function persistColumnOrder(nextColumns) {
    const ids = (Array.isArray(nextColumns) ? nextColumns : [])
      .map((c) => Number(c?.id))
      .filter(Number.isFinite)

    if (ids.length === 0) return

    const items = ids.map((id, idx) => ({ id, position: idx + 1 }))

    setSaving(true)
    setError('')
    try {
      await apiPatch('/kanban/columns/reorder', { items })
    } catch (e) {
      await loadBoard()
      setError(e?.message ? String(e.message) : 'Erro ao reordenar colunas')
    } finally {
      setSaving(false)
    }
  }

  function buildReorderItemsForColumn(colId, list) {
    const cards = Array.isArray(list) ? list : []
    return cards
      .map((c, idx) => ({
        id: Number(c?.id),
        column_id: Number(colId),
        position: idx + 1
      }))
      .filter((x) => Number.isFinite(x.id) && Number.isFinite(x.column_id) && Number.isFinite(x.position))
  }

  async function persistCardsReorderForColumns(colAId, colAList, colBId, colBList) {
    const itemsA = buildReorderItemsForColumn(colAId, colAList)
    const itemsB = colBId ? buildReorderItemsForColumn(colBId, colBList) : []
    const items = [...itemsA, ...itemsB]
    if (items.length === 0) return
    await apiPatch('/kanban/cards/reorder', { items })
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
      const cardId = parseCardId(event?.active?.id)
      if (!Number.isFinite(Number(cardId))) return
      const found = findCardInColumns(cardId)
      setActiveCardSnap(found?.card ? clone(found.card) : null)
      if (Number.isFinite(found?.colId)) setOverColId(Number(found.colId))
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
      if (Number.isFinite(colId)) setOverColId(colId)
      return
    }

    if (overType === 'col') {
      const colId = Number(over?.data?.current?.colId ?? over?.id)
      if (Number.isFinite(colId)) setOverColId(colId)
      return
    }

    const maybeDrop = parseColDropId(over?.id)
    if (Number.isFinite(maybeDrop)) setOverColId(maybeDrop)
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

      // atualiza state (mantendo shape)
      const normalized = next.map((c) => ({ ...c, name: c?.title ?? c?.name, cards: c?.cards ?? c?.contacts, contacts: c?.cards ?? c?.contacts }))
      setColumns(normalized)

      await persistColumnOrder(normalized)
      return
    }

    if (type === 'card') {
      const activeIdRaw = event?.active?.id
      const over = event?.over

      setActiveCardSnap(null)
      setOverColId(null)
      stopCardDragLockNow()

      const cardId = parseCardId(activeIdRaw)
      if (!Number.isFinite(cardId)) return
      if (!over?.id) return

      const fromFound = findCardInColumns(cardId)
      const fromColId = fromFound?.colId
      if (!Number.isFinite(fromColId)) return

      const overType = over?.data?.current?.type
      let toColId = null
      let overCardId = null

      if (overType === 'card') {
        toColId = Number(over?.data?.current?.colId)
        overCardId = parseCardId(over?.id)
      } else if (overType === 'colDrop') {
        toColId = Number(over?.data?.current?.colId)
      } else if (overType === 'col') {
        toColId = Number(over?.data?.current?.colId ?? over?.id)
      } else {
        const maybeDrop = parseColDropId(over?.id)
        if (Number.isFinite(maybeDrop)) toColId = maybeDrop
      }

      if (!Number.isFinite(Number(toColId))) return

      // reordenar dentro da mesma coluna
      if (Number(fromColId) === Number(toColId) && overType === 'card' && Number.isFinite(overCardId)) {
        const col = getColById(fromColId)
        const list = Array.isArray(col?.cards) ? col.cards : []

        const oldIndex = list.findIndex((c) => Number(c?.id) === Number(cardId))
        const newIndex = list.findIndex((c) => Number(c?.id) === Number(overCardId))
        if (oldIndex < 0 || newIndex < 0) return
        if (oldIndex === newIndex) return

        const nextList = arrayMove(list, oldIndex, newIndex)

        setSaving(true)
        setError('')
        setColumns((prev) =>
          prev.map((c) => {
            if (Number(c?.id) !== Number(fromColId)) return c
            return { ...c, cards: nextList, contacts: nextList }
          })
        )

        try {
          await persistCardsReorderForColumns(fromColId, nextList)
        } catch (e) {
          await loadBoard()
          setError(e?.message ? String(e.message) : 'Erro ao reordenar cards')
        } finally {
          setSaving(false)
        }
        return
      }

      // mover para outra coluna (ou para o final)
      const movingCard = fromFound?.card
      if (!movingCard) return

      // calcula index de inserção
      let insertIndex = null
      if (overType === 'card' && Number.isFinite(overCardId)) {
        const toCol = getColById(toColId)
        const toList = Array.isArray(toCol?.cards) ? toCol.cards : []
        const idx = toList.findIndex((c) => Number(c?.id) === Number(overCardId))
        insertIndex = idx >= 0 ? idx : toList.length
      } else {
        const toCol = getColById(toColId)
        const toList = Array.isArray(toCol?.cards) ? toCol.cards : []
        insertIndex = toList.length
      }

      setSaving(true)
      setError('')

      // atualiza state local já agrupando
      let fromNext = []
      let toNext = []

      setColumns((prev) => {
        const removed = prev.map((col) => {
          if (Number(col?.id) !== Number(fromColId)) return col
          const list = Array.isArray(col?.cards) ? col.cards : []
          const next = list.filter((c) => Number(c?.id) !== Number(cardId))
          fromNext = next
          return { ...col, cards: next, contacts: next }
        })

        const inserted = removed.map((col) => {
          if (Number(col?.id) !== Number(toColId)) return col
          const list = Array.isArray(col?.cards) ? [...col.cards] : []
          const exists = list.some((c) => Number(c?.id) === Number(cardId))
          if (exists) {
            toNext = list
            return col
          }

          let idx = Number(insertIndex)
          if (!Number.isFinite(idx)) idx = list.length
          if (idx < 0) idx = 0
          if (idx > list.length) idx = list.length

          // atualiza column_id do card no state (visual)
          const moved = { ...movingCard, column_id: Number(toColId) }
          list.splice(idx, 0, moved)
          toNext = list
          return { ...col, cards: list, contacts: list }
        })

        return inserted
      })

      try {
        await persistCardsReorderForColumns(fromColId, fromNext, toColId, toNext)
      } catch (e) {
        await loadBoard()
        setError(e?.message ? String(e.message) : 'Erro ao mover card')
      } finally {
        setSaving(false)
      }
    }
  }

  function handleDragCancel() {
    setActiveColId(null)
    setActiveColSnap(null)
    setActiveCardSnap(null)
    setOverColId(null)
    stopCardDragLockNow()
  }

  // modais
  function closeModal() {
    setModal({ type: null, col: null, card: null })
  }

  function openNewCardModal(col) {
    setError('')
    setNewCardTitle('')
    setNewCardDesc('')
    setModal({ type: 'newCard', col: col || null, card: null })
  }

  function openEditCardModal(col, card) {
    setError('')
    setEditCardTitle(String(card?.title || ''))
    setEditCardDesc(String(card?.description || ''))
    setModal({ type: 'editCard', col: col || null, card: card || null })
  }

  function openEditColModal(col) {
    setError('')
    setEditColName(String(col?.title || col?.name || ''))
    setEditColColor(String(col?.color || '#111111'))
    setModal({ type: 'editCol', col: col || null, card: null })
  }

  function resetNewColForm() {
    setNewColName('')
    setNewColColor('#111111')
  }

  async function createNewColumn() {
    if (creatingCol || saving) return
    const title = String(newColName || '').trim()
    if (!title.length) {
      setError('Informe o nome da coluna.')
      return
    }

    setCreatingCol(true)
    setError('')

    try {
      await apiPost('/kanban/columns', {
        title,
        color: String(newColColor || '').trim() || null
      })

      resetNewColForm()
      setShowNewCol(false)
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao criar coluna')
    } finally {
      setCreatingCol(false)
    }
  }

  async function createCardInColumn() {
    if (creatingCard || saving) return
    const col = modal?.col
    if (!col?.id) return

    const title = String(newCardTitle || '').trim()
    const description = String(newCardDesc || '').trim()

    if (!title.length) {
      setError('Informe o título do card.')
      return
    }

    setCreatingCard(true)
    setError('')

    try {
      await apiPost('/kanban/cards', {
        column_id: Number(col.id),
        title,
        description: description.length ? description : null
      })

      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao criar card')
      await loadBoard()
    } finally {
      setCreatingCard(false)
    }
  }

  async function updateCard() {
    if (updatingCard || saving) return
    const card = modal?.card
    if (!card?.id) return

    const title = String(editCardTitle || '').trim()
    const description = String(editCardDesc || '').trim()

    if (!title.length) {
      setError('Informe o título do card.')
      return
    }

    setUpdatingCard(true)
    setError('')

    try {
      await apiPatch(`/kanban/cards/${Number(card.id)}`, {
        title,
        description: description.length ? description : null
      })
      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao editar card')
      await loadBoard()
    } finally {
      setUpdatingCard(false)
    }
  }

  async function deleteCard(card) {
    if (deletingCard || saving) return
    if (!card?.id) return

    const ok = window.confirm(`Excluir o card "${card?.title || `#${card?.id}`}"?`)
    if (!ok) return

    setDeletingCard(true)
    setError('')

    try {
      await apiDelete(`/kanban/cards/${Number(card.id)}`)
      closeModal()
      await loadBoard()
    } catch (e) {
      setError(e?.message ? String(e.message) : 'Erro ao excluir card')
      await loadBoard()
    } finally {
      setDeletingCard(false)
    }
  }

  async function updateColumn() {
    if (updatingCol || saving) return
    const col = modal?.col
    if (!col?.id) return

    const title = String(editColName || '').trim()
    const color = String(editColColor || '').trim()

    if (!title.length) {
      setError('Informe o nome da coluna.')
      return
    }

    setUpdatingCol(true)
    setError('')

    try {
      await apiPatch(`/kanban/columns/${Number(col.id)}`, {
        title,
        color: color.length ? color : null
      })

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

    const ok = window.confirm(`Excluir a coluna "${col?.title || col?.name || `#${col?.id}`}"?`)
    if (!ok) return

    setDeletingCol(true)
    setError('')

    try {
      await apiDelete(`/kanban/columns/${Number(col.id)}`)
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
          <h1 className="pageTitle">Kanban</h1>
          <p className="pageSubtitle">
            Colunas e cards persistidos no Supabase. <b>{columns.length}</b> colunas · <b>{totalCards}</b> cards
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
                  placeholder="Ex: A fazer, Em andamento, Concluído..."
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
                    overColId={overColId}
                    hoverFooterColId={hoverFooterColId}
                    setHoverFooterColId={setHoverFooterColId}
                    getColById={getColById}
                    onOpenNewCard={openNewCardModal}
                    onOpenEditCol={openEditColModal}
                    onDeleteCol={deleteColumn}
                    onOpenEditCard={openEditCardModal}
                    onDeleteCard={deleteCard}
                    onOpenDrawer={openDrawerFromCard}
                  />
                ))}
              </SortableContext>
            </div>

            <DragOverlay dropAnimation={null}>
              {activeColSnap ? (
                <div style={{ pointerEvents: 'none', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.22))' }}>
                  <BoardColumnPreview col={activeColSnap} COL_W={COL_W} cardsOpacity={0.85} />
                </div>
              ) : activeCardSnap ? (
                <div
                  style={{
                    width: 'min(240px, 80vw)',
                    pointerEvents: 'none',
                    opacity: 0.98,
                    filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.18))'
                  }}
                >
                  <div style={{ border: '1px solid #bcdcff', borderRadius: 10, padding: 12, background: '#fff' }}>
                    <div style={{ fontWeight: 900 }}>{activeCardSnap?.title || `Card #${activeCardSnap?.id}`}</div>
                    {String(activeCardSnap?.description || '').trim().length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 13, color: '#444', lineHeight: 1.35 }}>
                        <b>Descrição:</b> {activeCardSnap.description}
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
      <CardDrawer mounted={drawerMounted} visible={drawerVisible} canInteract={canInteract} drawer={drawer} onClose={closeDrawer} onEdit={(col, card) => openEditCardModal(col, card)} />

      {/* ✅ Modal central */}
      <CenterModal
        modal={modal}
        error={error}
        canInteract={canInteract}
        closeModal={closeModal}
        // NEW CARD
        newCardTitle={newCardTitle}
        setNewCardTitle={setNewCardTitle}
        newCardDesc={newCardDesc}
        setNewCardDesc={setNewCardDesc}
        createCardInColumn={createCardInColumn}
        creatingCard={creatingCard}
        // EDIT CARD
        editCardTitle={editCardTitle}
        setEditCardTitle={setEditCardTitle}
        editCardDesc={editCardDesc}
        setEditCardDesc={setEditCardDesc}
        updateCard={updateCard}
        updatingCard={updatingCard}
        deleteCard={deleteCard}
        // EDIT COL
        editColName={editColName}
        setEditColName={setEditColName}
        editColColor={editColColor}
        setEditColColor={setEditColColor}
        updateColumn={updateColumn}
        updatingCol={updatingCol}
        deleteColumn={deleteColumn}
      />
    </div>
  )
}
// fim do caminho: front/src/pages/Kanban.jsx
