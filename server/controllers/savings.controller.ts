import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getSavings = (req: Request, res: Response) => {
  try {
    const { archived, accounting_code, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tSavings} WHERE 1=1`
    const params: any[] = []
    
    if (archived !== undefined) {
      query += ' AND archived = ?'
      params.push(archived === 'true' ? 1 : 0)
    }
    
    if (accounting_code) {
      query += ' AND accounting_code = ?'
      params.push(accounting_code)
    }
    
    query += ' ORDER BY created_at DESC'
    
    if (limit) {
      query += ' LIMIT ?'
      params.push(parseInt(limit as string))
      
      if (offset) {
        query += ' OFFSET ?'
        params.push(parseInt(offset as string))
      }
    }
    
    const savings = db.prepare(query).all(...params)
    res.json(savings)
  } catch (error) {
    console.error('Error fetching savings:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des épargnes' })
  }
}

export const getSaving = (req: Request, res: Response) => {
  try {
    const saving = db
      .prepare(`SELECT * FROM ${DbSchema.tSavings} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!saving) {
      return res.status(404).json({ error: 'Épargne non trouvée' })
    }
    
    res.json(saving)
  } catch (error) {
    console.error('Error fetching saving:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'épargne' })
  }
}

export const createSaving = (req: Request, res: Response) => {
  try {
    const { title, note, accounting_code } = req.body
    
    if (!title) {
      return res.status(400).json({ error: 'title est requis' })
    }
    
    const now = Date.now()
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tSavings} 
        (title, note, accounting_code, archived, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
      `)
      .run(
        title,
        note || null,
        accounting_code || null,
        now,
        now
      )
    
    const saving = db
      .prepare(`SELECT * FROM ${DbSchema.tSavings} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(saving)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({ error: 'Comptabilité non trouvée' })
    } else {
      console.error('Error creating saving:', error)
      res.status(500).json({ error: 'Erreur lors de la création de l\'épargne' })
    }
  }
}

export const updateSaving = (req: Request, res: Response) => {
  try {
    const { title, note, accounting_code, archived } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tSavings} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Épargne non trouvée' })
    }
    
    const now = Date.now()
    db.prepare(`
      UPDATE ${DbSchema.tSavings}
      SET title = COALESCE(?, title),
          note = ?,
          accounting_code = ?,
          archived = COALESCE(?, archived),
          updated_at = ?
      WHERE id = ?
    `).run(
      title || null,
      note !== undefined ? note : null,
      accounting_code !== undefined ? accounting_code : null,
      archived !== undefined ? (archived ? 1 : 0) : null,
      now,
      parseInt(id)
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tSavings} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating saving:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'épargne' })
  }
}

export const deleteSaving = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tSavings} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Épargne non trouvée' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting saving:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'épargne' })
  }
}




