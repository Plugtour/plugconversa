// caminho: routes/campaigns.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /campaigns -> criar campanha
router.post('/', async (req, res) => {
  try {
    const { name, description, scheduled_at, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name é obrigatório' });

    const q = `
      INSERT INTO campaigns (name, description, scheduled_at, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(q, [
      name,
      description || null,
      scheduled_at || null,
      status || 'rascunho',
    ]);

    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'erro ao criar campanha', details: String(err?.message || err) });
  }
});

// GET /campaigns -> listar campanhas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM campaigns ORDER BY id DESC;`);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'erro ao listar campanhas', details: String(err?.message || err) });
  }
});

module.exports = router;
