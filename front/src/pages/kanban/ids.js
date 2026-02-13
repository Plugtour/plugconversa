// caminho: front/src/pages/kanban/ids.js
export const COL_DROP_PREFIX = 'col-drop-'
export const CARD_PREFIX = 'card-'

export function makeCardId(contactId) {
  return `${CARD_PREFIX}${Number(contactId)}`
}

export function parseCardId(dndId) {
  const s = String(dndId || '')
  if (!s.startsWith(CARD_PREFIX)) return null
  const n = Number(s.slice(CARD_PREFIX.length))
  return Number.isFinite(n) ? n : null
}

export function makeColDropId(colId) {
  return `${COL_DROP_PREFIX}${Number(colId)}`
}

export function parseColDropId(dndId) {
  const s = String(dndId || '')
  if (!s.startsWith(COL_DROP_PREFIX)) return null
  const n = Number(s.slice(COL_DROP_PREFIX.length))
  return Number.isFinite(n) ? n : null
}
// fim do caminho: front/src/pages/kanban/ids.js
