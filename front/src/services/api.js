// caminho: front/src/services/api.js

// ✅ Ajuste: fallback seguro caso a env não exista
export const API_BASE = import.meta.env.VITE_API_URL || 'https://plugconversa-api.onrender.com'

async function readJsonOrThrow(res, method, path) {
  const txt = await res.text().catch(() => '')
  if (!res.ok) {
    let details = txt
    try {
      details = txt ? JSON.parse(txt) : txt
    } catch {}
    const msg =
      (typeof details === 'object' && details && (details.error || details.message))
        ? String(details.error || details.message)
        : String(details || `${method} ${path} falhou`)
    throw new Error(msg)
  }

  if (!txt) return null
  try {
    return JSON.parse(txt)
  } catch {
    return txt
  }
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`)
  return readJsonOrThrow(res, 'GET', path)
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  })
  return readJsonOrThrow(res, 'POST', path)
}

export async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  })
  return readJsonOrThrow(res, 'PATCH', path)
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' })
  return readJsonOrThrow(res, 'DELETE', path)
}

// fim do caminho: front/src/services/api.js
