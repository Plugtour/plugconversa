// caminho: routes/scheduled.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /scheduled -> agendar mensagem
router.post('/', async (req, res) => {
  try {
    const { contact_id, campaign_id, tag_id, message_text, scheduled_for, channel } = req.body;

    if (!contact_id || !message_text || !scheduled_for) {
      return res.status(400).json({ error: 'contact_id, message_text, scheduled_for são obrigatórios' });
    }

    const q = `
      INSERT INTO scheduled_messages (contact_id, campaign_id, tag_id, channel, message_text, scheduled_for)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const { rows } = await pool.query(q, [
      contact_id,
      campaign_id || null,
      tag_id || null,
      channel || 'whatsapp',
      message_text,
      scheduled_for,
    ]);

    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'erro ao agendar mensagem', details: String(err?.message || err) });
  }
});

// GET /scheduled -> listar agendamentos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT sm.*, c.name as contact_name
      FROM scheduled_messages sm
      JOIN contacts c ON c.id = sm.contact_id
      ORDER BY sm.id DESC;
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'erro ao listar agendamentos', details: String(err?.message || err) });
  }
});

// POST /scheduled/to-queue -> mover pendentes vencidas pra fila
router.post('/to-queue', async (req, res) => {
  try {
    const qSelect = `
      SELECT *
      FROM scheduled_messages
      WHERE status = 'pendente'
        AND scheduled_for <= NOW()
      ORDER BY scheduled_for ASC
      LIMIT 100;
    `;
    const { rows } = await pool.query(qSelect);

    let inserted = 0;

    for (const sm of rows) {
      const payload = { text: sm.message_text };

      await pool.query(
        `INSERT INTO message_queue (scheduled_message_id, contact_id, channel, payload)
         VALUES ($1, $2, $3, $4::jsonb);`,
        [sm.id, sm.contact_id, sm.channel || 'whatsapp', JSON.stringify(payload)]
      );

      await pool.query(
        `UPDATE scheduled_messages SET status='enfileirada', updated_at=NOW() WHERE id=$1;`,
        [sm.id]
      );

      inserted++;
    }

    return res.json({ ok: true, moved_to_queue: inserted });
  } catch (err) {
    return res.status(500).json({ error: 'erro ao mover para fila', details: String(err?.message || err) });
  }
});

module.exports = router;
