import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getAutoSaves = (req: Request, res: Response) => {
  try {
    const { enabled, accounting_code, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tAutoSaves} WHERE 1=1`
    const params: any[] = []
    
    if (enabled !== undefined) {
      query += ' AND enabled = ?'
      params.push(enabled === 'true' ? 1 : 0)
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
    
    const autoSaves = db.prepare(query).all(...params)
    res.json(autoSaves)
  } catch (error) {
    console.error('Error fetching auto saves:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des épargnes automatiques' })
  }
}

export const getAutoSave = (req: Request, res: Response) => {
  try {
    const autoSave = db
      .prepare(`SELECT * FROM ${DbSchema.tAutoSaves} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!autoSave) {
      return res.status(404).json({ error: 'Épargne automatique non trouvée' })
    }
    
    res.json(autoSave)
  } catch (error) {
    console.error('Error fetching auto save:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'épargne automatique' })
  }
}

export const createAutoSave = (req: Request, res: Response) => {
  try {
    const { title, note, amount, cadence, enabled, start_at, accounting_code } = req.body
    
    if (!title || amount === undefined || !cadence) {
      return res.status(400).json({ error: 'title, amount et cadence sont requis' })
    }
    
    if (!['daily', 'weekly', 'monthly'].includes(cadence)) {
      return res.status(400).json({ error: 'cadence doit être: daily, weekly ou monthly' })
    }
    
    if (amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    const now = Date.now()
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tAutoSaves} 
        (title, note, amount, cadence, enabled, start_at, last_run_at, accounting_code, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        title,
        note || null,
        amount,
        cadence,
        enabled !== undefined ? (enabled ? 1 : 0) : 1,
        start_at || null,
        null,
        accounting_code || null,
        now,
        now
      )
    
    const autoSave = db
      .prepare(`SELECT * FROM ${DbSchema.tAutoSaves} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(autoSave)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({ error: 'Comptabilité non trouvée' })
    } else {
      console.error('Error creating auto save:', error)
      res.status(500).json({ error: 'Erreur lors de la création de l\'épargne automatique' })
    }
  }
}

export const updateAutoSave = (req: Request, res: Response) => {
  try {
    const { title, note, amount, cadence, enabled, start_at, last_run_at, accounting_code } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tAutoSaves} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Épargne automatique non trouvée' })
    }
    
    if (cadence && !['daily', 'weekly', 'monthly'].includes(cadence)) {
      return res.status(400).json({ error: 'cadence doit être: daily, weekly ou monthly' })
    }
    
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    const now = Date.now()
    db.prepare(`
      UPDATE ${DbSchema.tAutoSaves}
      SET title = COALESCE(?, title),
          note = ?,
          amount = COALESCE(?, amount),
          cadence = COALESCE(?, cadence),
          enabled = COALESCE(?, enabled),
          start_at = ?,
          last_run_at = ?,
          accounting_code = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      title || null,
      note !== undefined ? note : null,
      amount !== undefined ? amount : null,
      cadence || null,
      enabled !== undefined ? (enabled ? 1 : 0) : null,
      start_at !== undefined ? start_at : null,
      last_run_at !== undefined ? last_run_at : null,
      accounting_code !== undefined ? accounting_code : null,
      now,
      parseInt(id)
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tAutoSaves} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating auto save:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'épargne automatique' })
  }
}

export const deleteAutoSave = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tAutoSaves} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Épargne automatique non trouvée' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting auto save:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'épargne automatique' })
  }
}

