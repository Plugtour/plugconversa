// caminho: db.js
const { Pool } = require('pg')

// ✅ No Render, a conexão vem do Environment Variables (DATABASE_URL)
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL não definida no ambiente.')
  // ✅ melhor falhar de forma explícita, senão o pg tenta defaults e confunde
  throw new Error('DATABASE_URL não definida no ambiente.')
}

// ✅ log seguro (sem senha) pra confirmar se está chegando a URL certa
try {
  const safe = new URL(connectionString)
  console.log('[DB] host:', safe.host)
  console.log('[DB] user:', safe.username)
  console.log('[DB] db:', safe.pathname)
} catch {
  console.log('[DB] connectionString recebida, mas não consegui parsear como URL (formato inválido).')
}

const pool = new Pool({
  connectionString,
  // ✅ Supabase exige SSL em produção (e no pooler normalmente também)
  ssl: { rejectUnauthorized: false }
})

// ✅ loga erros de conexão no pool (muito útil no Render)
pool.on('error', (err) => {
  console.error('[DB] Pool error:', err?.message || err)
})

module.exports = pool
// arquivo: db.js
