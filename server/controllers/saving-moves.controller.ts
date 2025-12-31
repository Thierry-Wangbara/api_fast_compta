import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getSavingMoves = (req: Request, res: Response) => {
  try {
    const { saving_id, direction, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tSavingMoves} WHERE 1=1`
    const params: any[] = []
    
    if (saving_id) {
      query += ' AND saving_id = ?'
      params.push(parseInt(saving_id as string))
    }
    
    if (direction) {
      query += ' AND direction = ?'
      params.push(direction)
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
    
    const moves = db.prepare(query).all(...params)
    res.json(moves)
  } catch (error) {
    console.error('Error fetching saving moves:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des mouvements' })
  }
}

export const getSavingMove = (req: Request, res: Response) => {
  try {
    const move = db
      .prepare(`SELECT * FROM ${DbSchema.tSavingMoves} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!move) {
      return res.status(404).json({ error: 'Mouvement non trouvé' })
    }
    
    res.json(move)
  } catch (error) {
    console.error('Error fetching saving move:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération du mouvement' })
  }
}

export const createSavingMove = (req: Request, res: Response) => {
  try {
    const { saving_id, direction, amount, note, occurred_at } = req.body
    
    if (!saving_id || !direction || amount === undefined) {
      return res.status(400).json({ error: 'saving_id, direction et amount sont requis' })
    }
    
    if (!['in', 'out'].includes(direction)) {
      return res.status(400).json({ error: 'direction doit être: in ou out' })
    }
    
    if (amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    const now = Date.now()
    const occurred = occurred_at || now
    
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tSavingMoves} 
        (saving_id, direction, amount, note, occurred_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        parseInt(saving_id),
        direction,
        amount,
        note || null,
        occurred,
        now
      )
    
    const move = db
      .prepare(`SELECT * FROM ${DbSchema.tSavingMoves} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(move)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({ error: 'Épargne non trouvée' })
    } else {
      console.error('Error creating saving move:', error)
      res.status(500).json({ error: 'Erreur lors de la création du mouvement' })
    }
  }
}

export const updateSavingMove = (req: Request, res: Response) => {
  try {
    const { direction, amount, note, occurred_at } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tSavingMoves} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Mouvement non trouvé' })
    }
    
    if (direction && !['in', 'out'].includes(direction)) {
      return res.status(400).json({ error: 'direction doit être: in ou out' })
    }
    
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    db.prepare(`
      UPDATE ${DbSchema.tSavingMoves}
      SET direction = COALESCE(?, direction),
          amount = COALESCE(?, amount),
          note = ?,
          occurred_at = COALESCE(?, occurred_at)
      WHERE id = ?
    `).run(
      direction || null,
      amount !== undefined ? amount : null,
      note !== undefined ? note : null,
      occurred_at || null,
      parseInt(id)
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tSavingMoves} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating saving move:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du mouvement' })
  }
}

export const deleteSavingMove = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tSavingMoves} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Mouvement non trouvé' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting saving move:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression du mouvement' })
  }
}

