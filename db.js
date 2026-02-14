// db.js
const { Pool } = require('pg')

// usa a variável de ambiente do Render
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não está definida no ambiente.')
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
})

module.exports = pool
