// caminho: front/src/pages/kanban/BoardColumn.jsx
import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import IconButton from './IconButton'
import { makeCardId, makeColDropId } from './ids'
import { colorOrDefault } from './utils'

function CardsDropZone({ colId, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: makeColDropId(colId),
    data: { type: 'colDrop', colId: Number(colId) }
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        borderRadius: 10,
        padding: 2,
        outline: isOver ? '2px dashed #8fc2ff' : 'none',
        transition: 'outline 120ms ease'
      }}
    >
      {children}
    </div>
  )
}

function SortableCard({
  colId,
  card,
  canInteract,
  activeColId,
  disabled,
  getColById,
  onOpenEditCard,
  onDeleteCard,
  onOpenDrawer
}) {
  const dndId = makeCardId(card?.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dndId,
    data: { type: 'card', colId: Number(colId), contactId: Number(card?.id) },
    disabled: !canInteract || !!activeColId || !!disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: '1px solid #eee',
    borderRadius: 10,
    padding: 12,
    background: '#fff',
    boxShadow: isDragging ? '0 10px 24px rgba(0,0,0,0.10)' : '0 1px 0 rgba(0,0,0,0.02)',
    cursor: !canInteract || !!activeColId || !!disabled ? 'not-allowed' : 'grab',
    opacity: isDragging ? 0.2 : canInteract ? 1 : 0.7,
    outline: isDragging ? '2px solid #bcdcff' : 'none'
  }

  const col = getColById?.(colId)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      title={canInteract ? 'Arraste para reordenar / mover' : 'Aguarde...'}
      onDoubleClick={(e) => {
        if (e?.target?.closest?.('[data-no-dnd="1"]')) return
        if (!canInteract) return
        onOpenDrawer?.(col, card)
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontWeight: 900, minWidth: 0 }}>
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-block',
              maxWidth: 140
            }}
          >
            {card?.name || `Contato #${card.id}`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#666' }}>#{card.id}</div>

          <IconButton title="Editar card" disabled={!canInteract} onClick={() => onOpenEditCard?.(getColById?.(colId), card)}>
            ✎
          </IconButton>

          <IconButton title="Excluir card" disabled={!canInteract} onClick={() => onDeleteCard?.(card)}>
            🗑
          </IconButton>
        </div>
      </div>

      <div style={{ marginTop: 6, fontSize: 13, color: '#333' }}>
        <b>Telefone:</b> {card?.phone || '-'}
      </div>

      {String(card?.notes || '').trim().length > 0 && (
        <div style={{ marginTop: 6, fontSize: 13, color: '#444', lineHeight: 1.35 }}>
          <b>Obs:</b> {card.notes}
        </div>
      )}
    </div>
  )
}

function ColumnUI({
  col,
  draggingSelf,
  COL_W,
  canInteract,
  overTagId,
  hoverFooterColId,
  setHoverFooterColId,
  getColById,
  onOpenNewCard,
  onOpenEditCol,
  onDeleteCol,
  onOpenEditCard,
  onDeleteCard,
  onOpenDrawer
}) {
  const colColor = colorOrDefault(col?.color)
  const contacts = Array.isArray(col?.contacts) ? col.contacts : []
  const isOverCard = Number(overTagId) === Number(col?.id)

  const cardIds = useMemo(() => contacts.map((c) => makeCardId(c.id)), [contacts])
  const isFooterHover = Number(hoverFooterColId) === Number(col?.id)

  return (
    <div
      data-col-root="1"
      style={{
        width: COL_W,
        borderRadius: 12,
        padding: 6,
        background: isOverCard ? '#eef6ff' : '#ededed',
        border: `1px solid ${isOverCard ? '#bcdcff' : '#e6e6e6'}`,
        height: '100%',
        minHeight: 520,
        transition: 'background 120ms ease, border-color 120ms ease',
        // ✅ coluna “de trás” some durante o drag
        opacity: draggingSelf ? 0 : 1
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          padding: 10,
          height: '100%',
          boxShadow: isOverCard ? '0 10px 24px rgba(0,0,0,0.06)' : '0 2px 10px rgba(0,0,0,0.03)',
          transition: 'box-shadow 120ms ease',
          overflow: 'hidden',
          position: 'relative',
          paddingBottom: 74
        }}
      >
        <div style={{ height: 8, background: colColor, borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 6px 6px' }}>
          <div style={{ fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {col?.name || `Tag #${col.id}`}
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#333',
                background: '#f3f3f3',
                padding: '4px 8px',
                borderRadius: 999
              }}
              title="Quantidade de cards"
            >
              {contacts.length}
            </div>
          </div>
        </div>

        {String(col?.ai_profile || '').trim().length > 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#666', lineHeight: 1.35, padding: '0 6px' }}>
            <b style={{ color: '#111' }}>IA:</b> {col.ai_profile}
          </div>
        )}

        <div style={{ marginTop: 10, padding: '0 6px 6px' }}>
          <CardsDropZone colId={col.id}>
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'grid', gap: 10 }}>
                {contacts.length === 0 ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: '#777',
                      background: '#fafafa',
                      border: `1px dashed ${isOverCard ? '#8fc2ff' : '#e6e6e6'}`,
                      borderRadius: 10,
                      padding: 12
                    }}
                  >
                    {isOverCard ? 'Solte aqui para mover.' : 'Nenhum contato nesta etiqueta.'}
                  </div>
                ) : (
                  contacts.map((c) => (
                    <SortableCard
                      key={c.id}
                      colId={col.id}
                      card={c}
                      canInteract={canInteract}
                      activeColId={null}
                      disabled={false}
                      getColById={getColById}
                      onOpenEditCard={onOpenEditCard}
                      onDeleteCard={onDeleteCard}
                      onOpenDrawer={onOpenDrawer}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </CardsDropZone>
        </div>

        {/* Rodapé com ações */}
        <div
          onMouseEnter={() => setHoverFooterColId(Number(col?.id))}
          onMouseMove={() => setHoverFooterColId(Number(col?.id))}
          onMouseLeave={() => setHoverFooterColId(null)}
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: 10,
            height: 54,
            borderRadius: 12,
            background: isFooterHover ? 'rgba(0,0,0,0.06)' : 'transparent',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 120ms ease'
          }}
          title="Passe o mouse aqui para ações da coluna"
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#666',
              fontWeight: 700,
              opacity: isFooterHover ? 0 : 1,
              transition: 'opacity 120ms ease',
              pointerEvents: 'none',
              letterSpacing: 0.2
            }}
          >
            Ações da Coluna
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              opacity: isFooterHover ? 1 : 0,
              transform: isFooterHover ? 'translateY(0px)' : 'translateY(4px)',
              transition: 'opacity 120ms ease, transform 120ms ease',
              pointerEvents: 'auto'
            }}
          >
            <IconButton title="Adicionar card nesta coluna" disabled={!canInteract} onClick={() => onOpenNewCard?.(col)}>
              +
            </IconButton>

            <IconButton title="Editar coluna" disabled={!canInteract} onClick={() => onOpenEditCol?.(col)}>
              ✎
            </IconButton>

            <IconButton title="Excluir coluna" disabled={!canInteract} onClick={() => onDeleteCol?.(col)}>
              🗑
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * ✅ Prévia para o DragOverlay (coluna “da frente” com cards visíveis)
 * - NÃO é droppable/sortable (é só visual)
 * - Pode deixar cards levemente apagados via props
 */
export function BoardColumnPreview({ col, COL_W, cardsOpacity = 0.85 }) {
  const colColor = colorOrDefault(col?.color)
  const contacts = Array.isArray(col?.contacts) ? col.contacts : []

  return (
    <div
      style={{
        width: COL_W,
        borderRadius: 12,
        padding: 6,
        background: '#ededed',
        border: '1px solid #e6e6e6',
        height: '100%',
        minHeight: 520
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          padding: 10,
          height: '100%',
          boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          position: 'relative',
          paddingBottom: 18
        }}
      >
        <div style={{ height: 8, background: colColor, borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 6px 6px' }}>
          <div style={{ fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {col?.name || `Tag #${col?.id}`}
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#333',
              background: '#f3f3f3',
              padding: '4px 8px',
              borderRadius: 999
            }}
            title="Quantidade de cards"
          >
            {contacts.length}
          </div>
        </div>

        {String(col?.ai_profile || '').trim().length > 0 && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#666', lineHeight: 1.35, padding: '0 6px' }}>
            <b style={{ color: '#111' }}>IA:</b> {col.ai_profile}
          </div>
        )}

        <div style={{ marginTop: 10, padding: '0 6px 6px' }}>
          <div style={{ display: 'grid', gap: 10, opacity: cardsOpacity }}>
            {contacts.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: '#777',
                  background: '#fafafa',
                  border: '1px dashed #e6e6e6',
                  borderRadius: 10,
                  padding: 12
                }}
              >
                Nenhum contato nesta etiqueta.
              </div>
            ) : (
              contacts.map((card) => (
                <div
                  key={card?.id}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: 10,
                    padding: 12,
                    background: '#fff',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontWeight: 900, minWidth: 0 }}>
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'inline-block',
                          maxWidth: 140
                        }}
                      >
                        {card?.name || `Contato #${card?.id}`}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>#{card?.id}</div>
                  </div>

                  <div style={{ marginTop: 6, fontSize: 13, color: '#333' }}>
                    <b>Telefone:</b> {card?.phone || '-'}
                  </div>

                  {String(card?.notes || '').trim().length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 13, color: '#444', lineHeight: 1.35 }}>
                      <b>Obs:</b> {card.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SortableColumn({
  col,
  COL_W,
  canInteract,
  isDraggingCard,
  isDraggingCardRef,
  overTagId,
  hoverFooterColId,
  setHoverFooterColId,
  getColById,
  onOpenNewCard,
  onOpenEditCol,
  onDeleteCol,
  onOpenEditCard,
  onDeleteCard,
  onOpenDrawer
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: String(col?.id),
    data: { type: 'col', colId: Number(col?.id) },
    disabled: !canInteract || isDraggingCard || isDraggingCardRef.current
  })

  const style = {
    height: '100%',
    width: COL_W,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    cursor: !canInteract || isDraggingCard || isDraggingCardRef.current ? 'not-allowed' : 'grab'
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ColumnUI
        col={col}
        draggingSelf={isDragging}
        COL_W={COL_W}
        canInteract={canInteract}
        overTagId={overTagId}
        hoverFooterColId={hoverFooterColId}
        setHoverFooterColId={setHoverFooterColId}
        getColById={getColById}
        onOpenNewCard={onOpenNewCard}
        onOpenEditCol={onOpenEditCol}
        onDeleteCol={onDeleteCol}
        onOpenEditCard={onOpenEditCard}
        onDeleteCard={onDeleteCard}
        onOpenDrawer={onOpenDrawer}
      />
    </div>
  )
}
// fim do caminho: front/src/pages/kanban/BoardColumn.jsx
