// caminho: plugconversa/index.js

require('dotenv').config() // ✅ carregar .env antes de qualquer coisa

const express = require('express')
const cors = require('cors')
const pool = require('./db')

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://app.plugconversa.com.br'
]

app.use(
  cors({
    origin: true,
    credentials: true
  })
)

app.use(express.json())

const tagsRoutes = require('./routes/tags.routes')
const campaignsRoutes = require('./routes/campaigns.routes')
const scheduledRoutes = require('./routes/scheduled.routes')
const queueRoutes = require('./routes/queue.routes')
const aiRoutes = require('./routes/ai.routes')
const kanbanRoutes = require('./routes/kanban.routes')

app.use('/tags', tagsRoutes)
app.use('/campaigns', campaignsRoutes)
app.use('/scheduled', scheduledRoutes)
app.use('/queue', queueRoutes)
app.use('/ai', aiRoutes)
app.use('/kanban', kanbanRoutes)

// Contatos
app.post('/contacts', async (req, res) => {
  const { name, phone, notes } = req.body

  if (!name || !phone) {
    return res.status(400).json({ error: 'name e phone são obrigatórios' })
  }

  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, phone, notes) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, notes || null]
    )

    return res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Erro ao criar contato:', err)
    return res.status(500).json({ error: 'Erro ao salvar contato no banco' })
  }
})

app.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, phone, notes, created_at FROM contacts ORDER BY id DESC'
    )
    return res.json(result.rows)
  } catch (err) {
    console.error('Erro ao listar contatos:', err)
    return res.status(500).json({ error: 'Erro ao buscar contatos no banco' })
  }
})

app.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'API PlugConversa está viva!' })
})

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now')
    return res.json({
      ok: true,
      now: result.rows[0].now
    })
  } catch (err) {
    console.error('Erro ao testar DB:', err)
    return res.status(500).json({
      ok: false,
      error: 'Erro ao conectar no banco',
      details: {
        message: err?.message,
        code: err?.code,
        severity: err?.severity
      }
    })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor PlugConversa rodando na porta ${PORT}`)
})

// fim do caminho: plugconversa/index.js
