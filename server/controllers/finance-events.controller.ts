import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getFinanceEvents = (req: Request, res: Response) => {
  try {
    const { type, ref_id, limit, offset, from_date, to_date } = req.query
    let query = `SELECT * FROM ${DbSchema.tFinanceEvents} WHERE 1=1`
    const params: any[] = []
    
    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }
    
    if (ref_id) {
      query += ' AND ref_id = ?'
      params.push(parseInt(ref_id as string))
    }
    
    if (from_date) {
      query += ' AND occurred_at >= ?'
      params.push(parseInt(from_date as string))
    }
    
    if (to_date) {
      query += ' AND occurred_at <= ?'
      params.push(parseInt(to_date as string))
    }
    
    query += ' ORDER BY occurred_at DESC, created_at DESC'
    
    if (limit) {
      query += ' LIMIT ?'
      params.push(parseInt(limit as string))
      
      if (offset) {
        query += ' OFFSET ?'
        params.push(parseInt(offset as string))
      }
    }
    
    const events = db.prepare(query).all(...params)
    res.json(events)
  } catch (error) {
    console.error('Error fetching finance events:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' })
  }
}

export const getFinanceEvent = (req: Request, res: Response) => {
  try {
    const event = db
      .prepare(`SELECT * FROM ${DbSchema.tFinanceEvents} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' })
    }
    
    res.json(event)
  } catch (error) {
    console.error('Error fetching finance event:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'événement' })
  }
}

export const createFinanceEvent = (req: Request, res: Response) => {
  try {
    const { type, ref_id, title, amount, meta, occurred_at } = req.body
    
    if (!type || !title) {
      return res.status(400).json({ error: 'type et title sont requis' })
    }
    
    const now = Date.now()
    const occurred = occurred_at || now
    
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tFinanceEvents} 
        (type, ref_id, title, amount, meta, occurred_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        type,
        ref_id || null,
        title,
        amount || null,
        meta ? JSON.stringify(meta) : null,
        occurred,
        now
      )
    
    const event = db
      .prepare(`SELECT * FROM ${DbSchema.tFinanceEvents} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(event)
  } catch (error) {
    console.error('Error creating finance event:', error)
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement' })
  }
}

export const updateFinanceEvent = (req: Request, res: Response) => {
  try {
    const { type, ref_id, title, amount, meta, occurred_at } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tFinanceEvents} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Événement non trouvé' })
    }
    
    db.prepare(`
      UPDATE ${DbSchema.tFinanceEvents}
      SET type = COALESCE(?, type),
          ref_id = ?,
          title = COALESCE(?, title),
          amount = ?,
          meta = ?,
          occurred_at = COALESCE(?, occurred_at)
      WHERE id = ?
    `).run(
      type || null,
      ref_id !== undefined ? ref_id : null,
      title || null,
      amount !== undefined ? amount : null,
      meta !== undefined ? JSON.stringify(meta) : null,
      occurred_at || null,
      parseInt(id)
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tFinanceEvents} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating finance event:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'événement' })
  }
}

export const deleteFinanceEvent = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tFinanceEvents} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting finance event:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'événement' })
  }
}

