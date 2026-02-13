// caminho: front/src/services/api.js

// ✅ Ajuste: fallback seguro caso a env não exista
const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://plugconversa-api.onrender.com';

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} falhou`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} falhou`);
  return res.json();
}
