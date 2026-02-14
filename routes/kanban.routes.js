// caminho: routes/kanban.routes.js
const express = require('express')
const router = express.Router()
const pool = require('../db')

function jsonError(res, status, error, err) {
  return res.status(status).json({
    ok: false,
    error,
    details: {
      message: err?.message,
      code: err?.code,
      severity: err?.severity
    }
  })
}

// =======================
// COLUNAS
// =======================

// GET /kanban/columns -> listar colunas ordenadas por position
router.get('/columns', async (req, res) => {
  try {
    const q = `
      SELECT id, title, position, color, created_at
      FROM public.kanban_columns
      ORDER BY position ASC, id ASC;
    `
    const { rows } = await pool.query(q)
    return res.json(rows)
  } catch (err) {
    return jsonError(res, 500, 'erro ao listar colunas', err)
  }
})

// POST /kanban/columns -> criar coluna (position no final)
router.post('/columns', async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim()
    const colorRaw = String(req.body?.color || '').trim()
    const color = colorRaw.length ? colorRaw : null

    if (!title.length) {
      return res.status(400).json({ ok: false, error: 'title é obrigatório' })
    }

    const q = `
      INSERT INTO public.kanban_columns (title, color, position)
      VALUES (
        $1,
        $2,
        COALESCE((SELECT MAX(position) FROM public.kanban_columns), 0) + 1
      )
      RETURNING id, title, position, color, created_at;
    `
    const { rows } = await pool.query(q, [title, color])
    return res.status(201).json(rows[0])
  } catch (err) {
    return jsonError(res, 500, 'erro ao criar coluna', err)
  }
})

// PATCH /kanban/columns/:id -> editar title/color/position
router.patch('/columns/:id', async (req, res) => {
  try {
    const id = Number(req.params?.id)
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: 'id inválido' })
    }

    const title =
      req.body?.title === undefined ? undefined : String(req.body?.title || '').trim()

    const color =
      req.body?.color === undefined
        ? undefined
        : (() => {
            const c = String(req.body?.color || '').trim()
            return c.length ? c : null
          })()

    const position =
      req.body?.position === undefined ? undefined : Number(req.body?.position)

    if (position !== undefined && !Number.isFinite(position)) {
      return res.status(400).json({ ok: false, error: 'position inválido' })
    }

    // nada pra atualizar
    if (title === undefined && color === undefined && position === undefined) {
      return res.status(400).json({ ok: false, error: 'nenhum campo para atualizar' })
    }

    const q = `
      UPDATE public.kanban_columns
      SET
        title = COALESCE($2, title),
        color = COALESCE($3, color),
        position = COALESCE($4, position)
      WHERE id = $1
      RETURNING id, title, position, color, created_at;
    `
    const { rows, rowCount } = await pool.query(q, [
      id,
      title === undefined ? null : title,
      color === undefined ? null : color,
      position === undefined ? null : position
    ])

    if (rowCount === 0) {
      return res.status(404).json({ ok: false, error: `coluna ${id} não existe` })
    }

    return res.json(rows[0])
  } catch (err) {
    return jsonError(res, 500, 'erro ao atualizar coluna', err)
  }
})

// DELETE /kanban/columns/:id -> apagar coluna (cards apagam por cascade)
router.delete('/columns/:id', async (req, res) => {
  try {
    const id = Number(req.params?.id)
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: 'id inválido' })
    }

    const q = `DELETE FROM public.kanban_columns WHERE id = $1 RETURNING id;`
    const { rowCount } = await pool.query(q, [id])

    if (rowCount === 0) {
      return res.status(404).json({ ok: false, error: `coluna ${id} não existe` })
    }

    return res.json({ ok: true, deleted: id })
  } catch (err) {
    return jsonError(res, 500, 'erro ao excluir coluna', err)
  }
})

// PATCH /kanban/columns/reorder -> atualizar positions em massa
// body: { items: [{ id, position }, ...] }
router.patch('/columns/reorder', async (req, res) => {
  const client = await pool.connect()
  try {
    const items = req.body?.items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'items (array) é obrigatório' })
    }

    const ids = []
    const positions = []

    for (const it of items) {
      const id = Number(it?.id)
      const pos = Number(it?.position)
      if (!Number.isFinite(id) || !Number.isFinite(pos)) {
        return res.status(400).json({ ok: false, error: 'items contém id/position inválido' })
      }
      ids.push(id)
      positions.push(pos)
    }

    // bloqueia duplicados
    const unique = new Set(ids)
    if (unique.size !== ids.length) {
      return res.status(400).json({ ok: false, error: 'items contém IDs duplicados' })
    }

    await client.query('BEGIN')

    const check = await client.query(
      `SELECT id FROM public.kanban_columns WHERE id = ANY($1::bigint[])`,
      [ids]
    )
    if (check.rowCount !== ids.length) {
      await client.query('ROLLBACK')
      return res.status(400).json({ ok: false, error: 'uma ou mais colunas não existem' })
    }

    const q = `
      UPDATE public.kanban_columns c
      SET position = v.pos
      FROM (
        SELECT
          unnest($1::bigint[]) AS id,
          unnest($2::int[]) AS pos
      ) v
      WHERE c.id = v.id;
    `
    await client.query(q, [ids, positions])

    await client.query('COMMIT')
    return res.json({ ok: true, updated: ids.length })
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch {}
    return jsonError(res, 500, 'erro ao reordenar colunas', err)
  } finally {
    client.release()
  }
})

// =======================
// CARDS
// =======================

// GET /kanban/cards?column_id=1 -> lista cards (ou todos se não passar column_id)
router.get('/cards', async (req, res) => {
  try {
    const columnIdRaw = req.query?.column_id
    const columnId = columnIdRaw === undefined ? null : Number(columnIdRaw)

    if (columnIdRaw !== undefined && !Number.isFinite(columnId)) {
      return res.status(400).json({ ok: false, error: 'column_id inválido' })
    }

    const q = columnId
      ? `
        SELECT id, column_id, title, description, position, created_at
        FROM public.kanban_cards
        WHERE column_id = $1
        ORDER BY position ASC, id ASC;
      `
      : `
        SELECT id, column_id, title, description, position, created_at
        FROM public.kanban_cards
        ORDER BY column_id ASC, position ASC, id ASC;
      `

    const { rows } = await pool.query(q, columnId ? [columnId] : [])
    return res.json(rows)
  } catch (err) {
    return jsonError(res, 500, 'erro ao listar cards', err)
  }
})

// POST /kanban/cards -> criar card na coluna (position no final daquela coluna)
// body: { column_id, title, description? }
router.post('/cards', async (req, res) => {
  try {
    const column_id = Number(req.body?.column_id)
    const title = String(req.body?.title || '').trim()
    const descRaw = String(req.body?.description || '').trim()
    const description = descRaw.length ? descRaw : null

    if (!Number.isFinite(column_id)) {
      return res.status(400).json({ ok: false, error: 'column_id é obrigatório e precisa ser número' })
    }
    if (!title.length) {
      return res.status(400).json({ ok: false, error: 'title é obrigatório' })
    }

    // valida coluna
    const check = await pool.query(`SELECT id FROM public.kanban_columns WHERE id=$1`, [column_id])
    if (check.rowCount === 0) {
      return res.status(400).json({ ok: false, error: `column_id ${column_id} não existe` })
    }

    const q = `
      INSERT INTO public.kanban_cards (column_id, title, description, position)
      VALUES (
        $1,
        $2,
        $3,
        COALESCE((SELECT MAX(position) FROM public.kanban_cards WHERE column_id = $1), 0) + 1
      )
      RETURNING id, column_id, title, description, position, created_at;
    `
    const { rows } = await pool.query(q, [column_id, title, description])
    return res.status(201).json(rows[0])
  } catch (err) {
    return jsonError(res, 500, 'erro ao criar card', err)
  }
})

// PATCH /kanban/cards/:id -> editar title/description/column_id/position
router.patch('/cards/:id', async (req, res) => {
  const client = await pool.connect()
  try {
    const id = Number(req.params?.id)
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: 'id inválido' })
    }

    const title =
      req.body?.title === undefined ? undefined : String(req.body?.title || '').trim()

    const description =
      req.body?.description === undefined
        ? undefined
        : (() => {
            const d = String(req.body?.description || '').trim()
            return d.length ? d : null
          })()

    const column_id =
      req.body?.column_id === undefined ? undefined : Number(req.body?.column_id)

    const position =
      req.body?.position === undefined ? undefined : Number(req.body?.position)

    if (column_id !== undefined && !Number.isFinite(column_id)) {
      return res.status(400).json({ ok: false, error: 'column_id inválido' })
    }
    if (position !== undefined && !Number.isFinite(position)) {
      return res.status(400).json({ ok: false, error: 'position inválido' })
    }
    if (title !== undefined && !title.length) {
      return res.status(400).json({ ok: false, error: 'title não pode ser vazio' })
    }

    if (title === undefined && description === undefined && column_id === undefined && position === undefined) {
      return res.status(400).json({ ok: false, error: 'nenhum campo para atualizar' })
    }

    await client.query('BEGIN')

    // valida card existe e pega coluna atual
    const cur = await client.query(
      `SELECT id, column_id FROM public.kanban_cards WHERE id=$1`,
      [id]
    )
    if (cur.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ ok: false, error: `card ${id} não existe` })
    }

    const currentColumnId = Number(cur.rows[0].column_id)
    const nextColumnId =
      column_id === undefined ? currentColumnId : Number(column_id)

    // valida coluna destino se mudou
    if (nextColumnId !== currentColumnId) {
      const checkCol = await client.query(`SELECT id FROM public.kanban_columns WHERE id=$1`, [nextColumnId])
      if (checkCol.rowCount === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ ok: false, error: `column_id ${nextColumnId} não existe` })
      }
    }

    const q = `
      UPDATE public.kanban_cards
      SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        column_id = COALESCE($4, column_id),
        position = COALESCE($5, position)
      WHERE id = $1
      RETURNING id, column_id, title, description, position, created_at;
    `
    const { rows } = await client.query(q, [
      id,
      title === undefined ? null : title,
      description === undefined ? null : description,
      column_id === undefined ? null : nextColumnId,
      position === undefined ? null : position
    ])

    await client.query('COMMIT')
    return res.json(rows[0])
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch {}
    return jsonError(res, 500, 'erro ao atualizar card', err)
  } finally {
    client.release()
  }
})

// DELETE /kanban/cards/:id -> apagar card
router.delete('/cards/:id', async (req, res) => {
  try {
    const id = Number(req.params?.id)
    if (!Number.isFinite(id)) {
      return res.status(400).json({ ok: false, error: 'id inválido' })
    }

    const q = `DELETE FROM public.kanban_cards WHERE id = $1 RETURNING id;`
    const { rowCount } = await pool.query(q, [id])

    if (rowCount === 0) {
      return res.status(404).json({ ok: false, error: `card ${id} não existe` })
    }

    return res.json({ ok: true, deleted: id })
  } catch (err) {
    return jsonError(res, 500, 'erro ao excluir card', err)
  }
})

// PATCH /kanban/cards/reorder -> atualizar positions (e column_id) em massa
// body: { items: [{ id, column_id, position }, ...] }
router.patch('/cards/reorder', async (req, res) => {
  const client = await pool.connect()
  try {
    const items = req.body?.items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'items (array) é obrigatório' })
    }

    const ids = []
    const colIds = []
    const positions = []

    for (const it of items) {
      const id = Number(it?.id)
      const column_id = Number(it?.column_id)
      const pos = Number(it?.position)

      if (!Number.isFinite(id) || !Number.isFinite(column_id) || !Number.isFinite(pos)) {
        return res.status(400).json({ ok: false, error: 'items contém id/column_id/position inválido' })
      }

      ids.push(id)
      colIds.push(column_id)
      positions.push(pos)
    }

    const unique = new Set(ids)
    if (unique.size !== ids.length) {
      return res.status(400).json({ ok: false, error: 'items contém IDs duplicados' })
    }

    await client.query('BEGIN')

    // valida cards existem
    const checkCards = await client.query(
      `SELECT id FROM public.kanban_cards WHERE id = ANY($1::bigint[])`,
      [ids]
    )
    if (checkCards.rowCount !== ids.length) {
      await client.query('ROLLBACK')
      return res.status(400).json({ ok: false, error: 'um ou mais cards não existem' })
    }

    // valida colunas destino existem (distinct)
    const uniqueCols = Array.from(new Set(colIds))
    const checkCols = await client.query(
      `SELECT id FROM public.kanban_columns WHERE id = ANY($1::bigint[])`,
      [uniqueCols]
    )
    if (checkCols.rowCount !== uniqueCols.length) {
      await client.query('ROLLBACK')
      return res.status(400).json({ ok: false, error: 'uma ou mais colunas destino não existem' })
    }

    const q = `
      UPDATE public.kanban_cards c
      SET
        column_id = v.column_id,
        position = v.pos
      FROM (
        SELECT
          unnest($1::bigint[]) AS id,
          unnest($2::bigint[]) AS column_id,
          unnest($3::int[]) AS pos
      ) v
      WHERE c.id = v.id;
    `
    await client.query(q, [ids, colIds, positions])

    await client.query('COMMIT')
    return res.json({ ok: true, updated: ids.length })
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch {}
    return jsonError(res, 500, 'erro ao reordenar cards', err)
  } finally {
    client.release()
  }
})

// =======================
// BOARD (colunas + cards agrupados)
// =======================

// GET /kanban/board -> colunas ordenadas + cards por coluna ordenados por position
router.get('/board', async (req, res) => {
  try {
    const q = `
      SELECT
        c.id,
        c.title,
        c.position,
        c.color,
        c.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', k.id,
              'column_id', k.column_id,
              'title', k.title,
              'description', k.description,
              'position', k.position,
              'created_at', k.created_at
            )
            ORDER BY k.position ASC, k.id ASC
          ) FILTER (WHERE k.id IS NOT NULL),
          '[]'::json
        ) AS cards
      FROM public.kanban_columns c
      LEFT JOIN public.kanban_cards k ON k.column_id = c.id
      GROUP BY c.id, c.title, c.position, c.color, c.created_at
      ORDER BY c.position ASC, c.id ASC;
    `
    const { rows } = await pool.query(q)
    return res.json(rows)
  } catch (err) {
    return jsonError(res, 500, 'erro ao montar board', err)
  }
})

module.exports = router
// fim do caminho: routes/kanban.routes.js
