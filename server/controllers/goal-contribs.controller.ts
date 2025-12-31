import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getGoalContribs = (req: Request, res: Response) => {
  try {
    const { goal_id, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tGoalContribs} WHERE 1=1`
    const params: any[] = []
    
    if (goal_id) {
      query += ' AND goal_id = ?'
      params.push(parseInt(goal_id as string))
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
    
    const contribs = db.prepare(query).all(...params)
    res.json(contribs)
  } catch (error) {
    console.error('Error fetching goal contributions:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des contributions' })
  }
}

export const getGoalContrib = (req: Request, res: Response) => {
  try {
    const contrib = db
      .prepare(`SELECT * FROM ${DbSchema.tGoalContribs} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!contrib) {
      return res.status(404).json({ error: 'Contribution non trouvée' })
    }
    
    res.json(contrib)
  } catch (error) {
    console.error('Error fetching goal contribution:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de la contribution' })
  }
}

export const createGoalContrib = (req: Request, res: Response) => {
  try {
    const { goal_id, amount, note, occurred_at } = req.body
    
    if (!goal_id || amount === undefined) {
      return res.status(400).json({ error: 'goal_id et amount sont requis' })
    }
    
    if (amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    const now = Date.now()
    const occurred = occurred_at || now
    
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tGoalContribs} 
        (goal_id, amount, note, occurred_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        parseInt(goal_id),
        amount,
        note || null,
        occurred,
        now
      )
    
    const contrib = db
      .prepare(`SELECT * FROM ${DbSchema.tGoalContribs} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(contrib)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({ error: 'Objectif non trouvé' })
    } else {
      console.error('Error creating goal contribution:', error)
      res.status(500).json({ error: 'Erreur lors de la création de la contribution' })
    }
  }
}

export const updateGoalContrib = (req: Request, res: Response) => {
  try {
    const { amount, note, occurred_at } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tGoalContribs} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Contribution non trouvée' })
    }
    
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    db.prepare(`
      UPDATE ${DbSchema.tGoalContribs}
      SET amount = COALESCE(?, amount),
          note = ?,
          occurred_at = COALESCE(?, occurred_at)
      WHERE id = ?
    `).run(
      amount !== undefined ? amount : null,
      note !== undefined ? note : null,
      occurred_at || null,
      parseInt(id)
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tGoalContribs} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating goal contribution:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la contribution' })
  }
}

export const deleteGoalContrib = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tGoalContribs} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contribution non trouvée' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting goal contribution:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de la contribution' })
  }
}

