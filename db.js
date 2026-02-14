// caminho: db.js
const { Pool } = require('pg')

// ✅ No Render, a conexão vem do Environment Variables (DATABASE_URL)
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL não definida no ambiente.')
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

/**
 * ✅ Supabase exige SSL em produção.
 * ✅ No Render pode ocorrer: SELF_SIGNED_CERT_IN_CHAIN
 * Por isso usamos rejectUnauthorized: false no pg.
 * (E no Render vamos adicionar NODE_TLS_REJECT_UNAUTHORIZED=0 como complemento, se necessário.)
 */
const ssl =
  process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false

const pool = new Pool({
  connectionString,
  ssl,
  // ✅ ajuda em ambientes que “dormem” e demoram a responder
  connectionTimeoutMillis: 10000
})

// ✅ loga erros de conexão no pool (muito útil no Render)
pool.on('error', (err) => {
  console.error('[DB] Pool error:', err?.message || err)
})

module.exports = pool
// fim: db.js
