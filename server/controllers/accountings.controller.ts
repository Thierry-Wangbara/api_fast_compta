import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getAccountings = (req: Request, res: Response) => {
  try {
    const accountings = db
      .prepare(`SELECT * FROM ${DbSchema.tAccountings} ORDER BY created_at DESC`)
      .all()
    res.json(accountings)
  } catch (error) {
    console.error('Error fetching accountings:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des comptabilités' })
  }
}

export const getAccounting = (req: Request, res: Response) => {
  try {
    const accounting = db
      .prepare(`SELECT * FROM ${DbSchema.tAccountings} WHERE code = ?`)
      .get(req.params.code)
    
    if (!accounting) {
      return res.status(404).json({ error: 'Comptabilité non trouvée' })
    }
    
    res.json(accounting)
  } catch (error) {
    console.error('Error fetching accounting:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de la comptabilité' })
  }
}

export const createAccounting = (req: Request, res: Response) => {
  try {
    const { code, name, type, parent_code, currency, opening_balance } = req.body
    
    if (!code || !name || !type) {
      return res.status(400).json({ error: 'code, name et type sont requis' })
    }
    
    if (!['linked', 'standalone', 'master'].includes(type)) {
      return res.status(400).json({ error: 'type doit être: linked, standalone ou master' })
    }
    
    const now = Date.now()
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tAccountings} 
        (code, name, type, parent_code, currency, opening_balance, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        code,
        name,
        type,
        parent_code || null,
        currency || 'XAF',
        opening_balance || 0,
        now,
        now
      )
    
    const accounting = db
      .prepare(`SELECT * FROM ${DbSchema.tAccountings} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(accounting)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Ce code de comptabilité existe déjà' })
    } else {
      console.error('Error creating accounting:', error)
      res.status(500).json({ error: 'Erreur lors de la création de la comptabilité' })
    }
  }
}

export const updateAccounting = (req: Request, res: Response) => {
  try {
    const { name, type, parent_code, currency, opening_balance } = req.body
    const { code } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tAccountings} WHERE code = ?`)
      .get(code) as any
    
    if (!existing) {
      return res.status(404).json({ error: 'Comptabilité non trouvée' })
    }
    
    if (type && !['linked', 'standalone', 'master'].includes(type)) {
      return res.status(400).json({ error: 'type doit être: linked, standalone ou master' })
    }
    
    const now = Date.now()
    db.prepare(`
      UPDATE ${DbSchema.tAccountings}
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          parent_code = ?,
          currency = COALESCE(?, currency),
          opening_balance = COALESCE(?, opening_balance),
          updated_at = ?
      WHERE code = ?
    `).run(
      name || null,
      type || null,
      parent_code !== undefined ? parent_code : existing.parent_code,
      currency || null,
      opening_balance !== undefined ? opening_balance : null,
      now,
      code
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tAccountings} WHERE code = ?`)
      .get(code)
    
    res.json(updated)
  } catch (error: any) {
    console.error('Error updating accounting:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la comptabilité' })
  }
}

export const deleteAccounting = (req: Request, res: Response) => {
  try {
    const { code } = req.params
    
    // Ne pas permettre la suppression du compte MASTER
    if (code === 'MASTER') {
      return res.status(403).json({ error: 'Impossible de supprimer le compte MASTER' })
    }
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tAccountings} WHERE code = ?`)
      .run(code)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comptabilité non trouvée' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting accounting:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de la comptabilité' })
  }
}

