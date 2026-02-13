// caminho: front/src/pages/contatos/utils.js
export function normalizePhone(v) {
  const s = String(v || '').trim()
  if (!s) return ''
  // mantém + e números
  let out = s.replace(/[^\d+]/g, '')
  // se tiver mais de um +, limpa
  const firstPlus = out.indexOf('+')
  if (firstPlus > 0) out = out.replace(/\+/g, '')
  if (firstPlus === 0) out = '+' + out.slice(1).replace(/\+/g, '')
  return out
}

export function formatBRDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'

  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear())
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')

  return `${dd}/${mm}/${yy} ${hh}:${mi}`
}
// fim: front/src/pages/contatos/utils.js
