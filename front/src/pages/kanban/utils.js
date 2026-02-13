// caminho: front/src/pages/kanban/utils.js
export function colorOrDefault(color) {
  const c = String(color || '').trim()
  return c.length ? c : '#111'
}

export function safeJsonParse(str) {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

export function clone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    return obj
  }
}
// fim do caminho: front/src/pages/kanban/utils.js
