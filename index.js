// caminho: plugconversa/index.js

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const tagsRoutes = require('./routes/tags.routes');
const campaignsRoutes = require('./routes/campaigns.routes');
const scheduledRoutes = require('./routes/scheduled.routes');
const queueRoutes = require('./routes/queue.routes');
const aiRoutes = require('./routes/ai.routes');

app.use('/tags', tagsRoutes);
app.use('/campaigns', campaignsRoutes);
app.use('/scheduled', scheduledRoutes);
app.use('/queue', queueRoutes);
app.use('/ai', aiRoutes);

/**
 * Criar contato (salvando no PostgreSQL)
 * POST /contacts
 * Body JSON:
 * {
 *   "name": "Nome do Cliente",
 *   "phone": "+5599999999999",
 *   "notes": "Alguma observação"
 * }
 */
app.post('/contacts', async (req, res) => {
  const { name, phone, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'name e phone são obrigatórios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, phone, notes) VALUES ($1, $2, $3) RETURNING *',
      [name, phone, notes || null]
    );

    const newContact = result.rows[0];
    return res.status(201).json(newContact);
  } catch (err) {
    console.error('Erro ao criar contato:', err);
    return res.status(500).json({ error: 'Erro ao salvar contato no banco' });
  }
});

/**
 * Listar todos os contatos
 * GET /contacts
 */
app.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, phone, notes, created_at FROM contacts ORDER BY id DESC'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar contatos:', err);
    return res.status(500).json({ error: 'Erro ao buscar contatos no banco' });
  }
});

// Rota de teste (saúde da API)
app.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'API PlugConversa está viva!' });
});

// Testar conexão com o banco
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    return res.json({
      ok: true,
      now: result.rows[0].now,
    });
  } catch (err) {
    console.error('Erro ao testar DB:', err);
    return res.status(500).json({ ok: false, error: 'Erro ao conectar no banco' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor PlugConversa rodando em http://localhost:${PORT}`);
});

// fim: plugconversa/index.js
