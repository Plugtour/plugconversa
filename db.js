// caminho: plugconversa/db.js
const { Pool } = require('pg')

// ✅ No Render/produção, a conexão vem do Environment Variables (DATABASE_URL)
// ✅ Local, você também está usando Supabase remoto, então SSL precisa estar ativo
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
 * ✅ Supabase geralmente exige SSL SEMPRE (mesmo em dev) quando o banco é remoto.
 * Então ativamos SSL se:
 * - NODE_ENV=production, OU
 * - a URL tiver "supabase.co", OU
 * - PGSSLMODE=require (opcional)
 */
const shouldUseSSL =
  process.env.NODE_ENV === 'production' ||
  String(connectionString).includes('supabase.co') ||
  String(process.env.PGSSLMODE || '').toLowerCase() === 'require'

const ssl = shouldUseSSL ? { rejectUnauthorized: false } : false

const pool = new Pool({
  connectionString,
  ssl,
  connectionTimeoutMillis: 10000
})

// ✅ loga erros de conexão no pool (muito útil no Render)
pool.on('error', (err) => {
  console.error('[DB] Pool error:', err?.message || err)
})

module.exports = pool
// fim do caminho: plugconversa/db.js
