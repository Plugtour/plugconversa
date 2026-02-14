// caminho: db.js
const { Pool } = require('pg')

// ✅ No Render, a conexão vem do Environment Variables (DATABASE_URL)
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL não definida no ambiente.')
}

const pool = new Pool({
  connectionString,
  // ✅ Supabase exige SSL em produção
  ssl: { rejectUnauthorized: false }
})

module.exports = pool
// arquivo: db.js
