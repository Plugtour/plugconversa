// caminho: routes/tags.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /tags -> criar etiqueta
router.post('/', async (req, res) => {
  try {
    const { name, color, ai_profile } = req.body;
    if (!name) return res.status(400).json({ error: 'name é obrigatório' });

    // position: coloca no final (max+1)
    const q = `
      INSERT INTO tags (name, color, ai_profile, position)
      VALUES (
        $1,
        $2,
        $3,
        COALESCE((SELECT MAX(position) FROM tags), 0) + 1
      )
      RETURNING *;
    `;
    const { rows } = await pool.query(q, [name, color || null, ai_profile || null]);
    return res.json(rows[0]);
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'erro ao criar etiqueta', details: String(err?.message || err) });
  }
});

// GET /tags -> listar etiquetas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM tags ORDER BY position ASC NULLS LAST, id ASC;`);
    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'erro ao listar etiquetas', details: String(err?.message || err) });
  }
});

// GET /tags/board -> colunas (tags) + contatos por etiqueta (cards)
router.get('/board', async (req, res) => {
  try {
    const q = `
      SELECT
        t.id,
        t.name,
        t.color,
        t.ai_profile,
        t.position,
        t.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'phone', c.phone,
              'notes', c.notes,
              'created_at', c.created_at
            )
            ORDER BY c.id DESC
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS contacts
      FROM tags t
      LEFT JOIN contact_tags ct ON ct.tag_id = t.id
      LEFT JOIN contacts c ON c.id = ct.contact_id
      GROUP BY t.id, t.name, t.color, t.ai_profile, t.position, t.created_at
      ORDER BY t.position ASC NULLS LAST, t.id ASC;
    `;

    const { rows } = await pool.query(q);
    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'erro ao montar board', details: String(err?.message || err) });
  }
});

// POST /tags/assign -> associar etiqueta a contato
router.post('/assign', async (req, res) => {
  try {
    const { contact_id, tag_id } = req.body;
    if (!contact_id || !tag_id) {
      return res.status(400).json({ error: 'contact_id e tag_id são obrigatórios' });
    }

    const cid = Number(contact_id);
    const tid = Number(tag_id);

    if (!Number.isFinite(cid) || !Number.isFinite(tid)) {
      return res.status(400).json({ error: 'IDs inválidos (precisam ser números)' });
    }

    // valida existência
    const checkContact = await pool.query(`SELECT id FROM contacts WHERE id=$1`, [cid]);
    if (checkContact.rowCount === 0) {
      return res.status(400).json({ error: `contact_id ${cid} não existe` });
    }

    const checkTag = await pool.query(`SELECT id FROM tags WHERE id=$1`, [tid]);
    if (checkTag.rowCount === 0) {
      return res.status(400).json({ error: `tag_id ${tid} não existe` });
    }

    const q = `
      INSERT INTO contact_tags (contact_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT (contact_id, tag_id) DO NOTHING
      RETURNING *;
    `;
    const { rows } = await pool.query(q, [cid, tid]);

    return res.json({ ok: true, assigned: rows[0] || null });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'erro ao associar etiqueta', details: String(err?.message || err) });
  }
});

// POST /tags/move -> mover contato de uma etiqueta para outra (Kanban)
router.post('/move', async (req, res) => {
  const client = await pool.connect();
  try {
    const { contact_id, from_tag_id, to_tag_id } = req.body;

    if (!contact_id || !from_tag_id || !to_tag_id) {
      return res.status(400).json({
        error: 'contact_id, from_tag_id e to_tag_id são obrigatórios',
      });
    }

    const cid = Number(contact_id);
    const fromId = Number(from_tag_id);
    const toId = Number(to_tag_id);

    if (!Number.isFinite(cid) || !Number.isFinite(fromId) || !Number.isFinite(toId)) {
      return res.status(400).json({
        error: 'IDs inválidos (precisam ser números)',
      });
    }

    if (fromId === toId) {
      return res.json({ ok: true, moved: false, reason: 'from_tag_id e to_tag_id são iguais' });
    }

    await client.query('BEGIN');

    // valida contato
    const contactOk = await client.query(`SELECT id FROM contacts WHERE id=$1`, [cid]);
    if (contactOk.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `contact_id ${cid} não existe` });
    }

    // valida tag origem e destino
    const fromOk = await client.query(`SELECT id FROM tags WHERE id=$1`, [fromId]);
    if (fromOk.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `from_tag_id ${fromId} não existe` });
    }

    const toOk = await client.query(`SELECT id FROM tags WHERE id=$1`, [toId]);
    if (toOk.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `to_tag_id ${toId} não existe` });
    }

    // garante que o contato está na tag origem
    const hasFrom = await client.query(
      `SELECT 1 FROM contact_tags WHERE contact_id=$1 AND tag_id=$2 LIMIT 1;`,
      [cid, fromId]
    );
    if (hasFrom.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `contato ${cid} não está associado à tag ${fromId}`,
      });
    }

    // remove da tag antiga
    await client.query(
      `DELETE FROM contact_tags WHERE contact_id=$1 AND tag_id=$2;`,
      [cid, fromId]
    );

    // adiciona na tag nova
    const ins = await client.query(
      `
      INSERT INTO contact_tags (contact_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT (contact_id, tag_id) DO NOTHING
      RETURNING *;
      `,
      [cid, toId]
    );

    await client.query('COMMIT');

    return res.json({
      ok: true,
      moved: true,
      assigned: ins.rows[0] || null,
      contact_id: cid,
      from_tag_id: fromId,
      to_tag_id: toId,
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    return res
      .status(500)
      .json({ error: 'erro ao mover etiqueta', details: String(err?.message || err) });
  } finally {
    client.release();
  }
});

// POST /tags/reorder -> salvar a ordem das colunas (tags)
// body: { ordered_tag_ids: [3,1,2] }
router.post('/reorder', async (req, res) => {
  const client = await pool.connect();
  try {
    const { ordered_tag_ids } = req.body;

    if (!Array.isArray(ordered_tag_ids) || ordered_tag_ids.length === 0) {
      return res.status(400).json({ error: 'ordered_tag_ids (array) é obrigatório' });
    }

    const ids = ordered_tag_ids.map((x) => Number(x)).filter(Number.isFinite);
    if (ids.length !== ordered_tag_ids.length) {
      return res.status(400).json({ error: 'ordered_tag_ids contém IDs inválidos' });
    }

    // ✅ bloqueia duplicados (isso quebra a atualização)
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
      return res.status(400).json({ error: 'ordered_tag_ids contém IDs duplicados' });
    }

    await client.query('BEGIN');

    // valida se todas as tags existem
    const check = await client.query(`SELECT id FROM tags WHERE id = ANY($1::int[])`, [ids]);
    if (check.rowCount !== ids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'uma ou mais tags não existem' });
    }

    // ✅ update robusto (parametrizado) com unnest
    // positions: 1..N
    const positions = ids.map((_, i) => i + 1);

    const q = `
      UPDATE tags t
      SET position = v.pos
      FROM (
        SELECT
          unnest($1::int[]) AS id,
          unnest($2::int[]) AS pos
      ) v
      WHERE t.id = v.id;
    `;
    await client.query(q, [ids, positions]);

    await client.query('COMMIT');
    return res.json({ ok: true, updated: ids.length });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    return res
      .status(500)
      .json({ error: 'erro ao reordenar colunas', details: String(err?.message || err) });
  } finally {
    client.release();
  }
});

module.exports = router;
