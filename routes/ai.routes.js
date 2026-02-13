// caminho: routes/ai.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /ai/generate
router.post('/generate', async (req, res) => {
  try {
    const { contact_id, tag_id } = req.body;

    if (!contact_id || !tag_id) {
      return res.status(400).json({ error: 'contact_id e tag_id são obrigatórios' });
    }

    // contato
    const contactRes = await pool.query(
      `SELECT id, name, phone, notes FROM contacts WHERE id = $1`,
      [contact_id]
    );
    if (contactRes.rows.length === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // etiqueta
    const tagRes = await pool.query(
      `SELECT id, name, ai_profile FROM tags WHERE id = $1`,
      [tag_id]
    );
    if (tagRes.rows.length === 0) {
      return res.status(404).json({ error: 'Etiqueta não encontrada' });
    }

    const contact = contactRes.rows[0];
    const tag = tagRes.rows[0];

    // prompt (pronto pra ligar no Gemini/ChatGPT depois)
    const prompt = `
Você é um assistente de atendimento via WhatsApp.

Perfil da IA:
${tag.ai_profile}

Dados do contato:
Nome: ${contact.name}
Telefone: ${contact.phone}
Observações: ${contact.notes || 'Nenhuma'}

Crie uma mensagem curta, natural e humana para iniciar a conversa.
`.trim();

    // IA simulada (por enquanto)
    const message = `Oi ${contact.name}! Tudo bem? Vi seu interesse e estou por aqui pra te ajudar no que precisar 🙂`;

    return res.json({ ok: true, prompt, message });
  } catch (err) {
    return res.status(500).json({
      error: 'erro ao gerar mensagem',
      details: String(err?.message || err)
    });
  }
});
// POST /ai/generate-and-schedule
router.post('/generate-and-schedule', async (req, res) => {
  try {
    const { contact_id, tag_id, campaign_id, scheduled_for } = req.body;

    if (!contact_id || !tag_id) {
      return res.status(400).json({ error: 'contact_id e tag_id são obrigatórios' });
    }

    // se campaign_id não vier, usamos null
    const campaignId = campaign_id ?? null;

    // se scheduled_for não vier, agenda para agora (NOW)
    // (pode trocar depois para NOW + 1 minuto se quiser)
    const scheduledFor = scheduled_for || null;

    // buscar contato
    const contactRes = await pool.query(
      `SELECT id, name, phone, notes FROM contacts WHERE id = $1`,
      [contact_id]
    );
    if (contactRes.rows.length === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // buscar etiqueta
    const tagRes = await pool.query(
      `SELECT id, name, ai_profile FROM tags WHERE id = $1`,
      [tag_id]
    );
    if (tagRes.rows.length === 0) {
      return res.status(404).json({ error: 'Etiqueta não encontrada' });
    }

    const contact = contactRes.rows[0];
    const tag = tagRes.rows[0];

    // prompt pronto para IA real depois
    const prompt = `
Você é um assistente de atendimento via WhatsApp.

Perfil da IA:
${tag.ai_profile}

Dados do contato:
Nome: ${contact.name}
Telefone: ${contact.phone}
Observações: ${contact.notes || 'Nenhuma'}

Crie uma mensagem curta, natural e humana para iniciar a conversa.
`.trim();

    // IA simulada (por enquanto)
    const messageText = `Oi ${contact.name}! Tudo bem? Vi seu interesse e estou por aqui pra te ajudar no que precisar 🙂`;

    // inserir em scheduled_messages
    const insertSql = `
      INSERT INTO scheduled_messages
        (contact_id, campaign_id, tag_id, channel, message_text, scheduled_for, status)
      VALUES
        ($1, $2, $3, 'whatsapp', $4, COALESCE($5::timestamp, NOW()), 'pendente')
      RETURNING *;
    `;

    const saved = await pool.query(insertSql, [
      contact_id,
      campaignId,
      tag_id,
      messageText,
      scheduledFor
    ]);

    return res.json({
      ok: true,
      prompt,
      generated_message: messageText,
      scheduled_message: saved.rows[0]
    });
  } catch (err) {
    return res.status(500).json({
      error: 'erro ao gerar e agendar',
      details: String(err?.message || err)
    });
  }
});

// POST /ai/generate-and-send
router.post('/generate-and-send', async (req, res) => {
  try {
    const { contact_id, tag_id, campaign_id } = req.body;

    if (!contact_id || !tag_id) {
      return res.status(400).json({ error: 'contact_id e tag_id são obrigatórios' });
    }

    const campaignId = campaign_id ?? null;

    // 1) buscar contato
    const contactRes = await pool.query(
      `SELECT id, name, phone, notes FROM contacts WHERE id = $1`,
      [contact_id]
    );
    if (contactRes.rows.length === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // 2) buscar etiqueta
    const tagRes = await pool.query(
      `SELECT id, name, ai_profile FROM tags WHERE id = $1`,
      [tag_id]
    );
    if (tagRes.rows.length === 0) {
      return res.status(404).json({ error: 'Etiqueta não encontrada' });
    }

    const contact = contactRes.rows[0];
    const tag = tagRes.rows[0];

    // 3) prompt (pronto pra IA real depois)
    const prompt = `
Você é um assistente de atendimento via WhatsApp.

Perfil da IA:
${tag.ai_profile}

Dados do contato:
Nome: ${contact.name}
Telefone: ${contact.phone}
Observações: ${contact.notes || 'Nenhuma'}

Crie uma mensagem curta, natural e humana para iniciar a conversa.
`.trim();

    // 4) IA simulada (por enquanto)
    const messageText = `Oi ${contact.name}! Tudo bem? Vi seu interesse e estou por aqui pra te ajudar no que precisar 🙂`;

    // 5) gravar em scheduled_messages (já para agora)
    const insertScheduled = `
      INSERT INTO scheduled_messages
        (contact_id, campaign_id, tag_id, channel, message_text, scheduled_for, status)
      VALUES
        ($1, $2, $3, 'whatsapp', $4, NOW(), 'pendente')
      RETURNING *;
    `;
    const scheduledRes = await pool.query(insertScheduled, [
      contact_id,
      campaignId,
      tag_id,
      messageText
    ]);
    const scheduled = scheduledRes.rows[0];

    // 6) colocar na fila (queued)
    const payload = { text: messageText };

    const insertQueue = `
      INSERT INTO message_queue
        (scheduled_message_id, contact_id, channel, payload, status, attempts, max_attempts, next_attempt_at, priority, created_at, updated_at)
      VALUES
        ($1, $2, 'whatsapp', $3::jsonb, 'queued', 0, 3, NOW(), 10, NOW(), NOW())
      RETURNING *;
    `;
    const queueRes = await pool.query(insertQueue, [
      scheduled.id,
      contact_id,
      JSON.stringify(payload)
    ]);
    const queueItem = queueRes.rows[0];

    // 7) PROCESSAR imediatamente (simulação de envio)
    await pool.query(
      `UPDATE message_queue SET status='sending', updated_at=NOW() WHERE id=$1;`,
      [queueItem.id]
    );

    // simula envio -> sent
    await pool.query(
      `UPDATE message_queue SET status='sent', updated_at=NOW() WHERE id=$1;`,
      [queueItem.id]
    );

    // marcar agendamento como enviada
    await pool.query(
      `UPDATE scheduled_messages SET status='enviada', updated_at=NOW() WHERE id=$1;`,
      [scheduled.id]
    );

    return res.json({
      ok: true,
      prompt,
      generated_message: messageText,
      scheduled_message_id: scheduled.id,
      queue_id: queueItem.id,
      result: { scheduled_status: 'enviada', queue_status: 'sent' }
    });
  } catch (err) {
    return res.status(500).json({
      error: 'erro ao gerar e enviar',
      details: String(err?.message || err)
    });
  }
});

module.exports = router;
