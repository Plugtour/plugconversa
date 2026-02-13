// caminho: routes/queue.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /queue -> listar fila
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT mq.*, c.name as contact_name
      FROM message_queue mq
      JOIN contacts c ON c.id = mq.contact_id
      ORDER BY mq.status ASC, mq.next_attempt_at ASC
      LIMIT 200;
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'erro ao listar fila', details: String(err?.message || err) });
  }
});

// POST /queue/process -> processar fila (simulação)
router.post('/process', async (req, res) => {
  try {
    const limit = Number(req.body?.limit || 10);

    const qPick = `
      SELECT *
      FROM message_queue
      WHERE status = 'queued'
        AND next_attempt_at <= NOW()
      ORDER BY priority ASC, id ASC
      LIMIT $1;
    `;
    const { rows } = await pool.query(qPick, [limit]);

    let sent = 0;
    let failed = 0;

    for (const item of rows) {
      // marca como "sending"
      await pool.query(
        `UPDATE message_queue SET status='sending', updated_at=NOW() WHERE id=$1;`,
        [item.id]
      );

      try {
        // SIMULA envio: marca como "sent"
        await pool.query(
          `UPDATE message_queue SET status='sent', updated_at=NOW() WHERE id=$1;`,
          [item.id]
        );

        // ✅ NOVO: marca o agendamento como "enviada"
        if (item.scheduled_message_id) {
          await pool.query(
            `UPDATE scheduled_messages SET status='enviada', updated_at=NOW() WHERE id=$1;`,
            [item.scheduled_message_id]
          );
        }

        sent++;
      } catch (e) {
        const attempts = Number(item.attempts || 0) + 1;
        const maxAttempts = Number(item.max_attempts || 3);

        if (attempts >= maxAttempts) {
          await pool.query(
            `UPDATE message_queue
             SET status='failed', attempts=$2, last_error=$3, updated_at=NOW()
             WHERE id=$1;`,
            [item.id, attempts, String(e?.message || 'erro')]
          );
        } else {
          await pool.query(
            `UPDATE message_queue
             SET status='queued', attempts=$2, last_error=$3,
                 next_attempt_at=NOW() + INTERVAL '30 seconds',
                 updated_at=NOW()
             WHERE id=$1;`,
            [item.id, attempts, String(e?.message || 'erro')]
          );
        }
        failed++;
      }
    }

    return res.json({ ok: true, picked: rows.length, sent, failed });
  } catch (err) {
    return res.status(500).json({ error: 'erro ao processar fila', details: String(err?.message || err) });
  }
});

module.exports = router;
