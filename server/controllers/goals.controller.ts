import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getGoals = (req: Request, res: Response) => {
  try {
    const { archived, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tGoals} WHERE 1=1`
    const params: any[] = []
    
    if (archived !== undefined) {
      query += ' AND archived = ?'
      params.push(archived === 'true' ? 1 : 0)
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
    
    const goals = db.prepare(query).all(...params)
    res.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des objectifs' })
  }
}

export const getGoal = (req: Request, res: Response) => {
  try {
    const goal = db
      .prepare(`SELECT * FROM ${DbSchema.tGoals} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!goal) {
      return res.status(404).json({ error: 'Objectif non trouvé' })
    }
    
    res.json(goal)
  } catch (error) {
    console.error('Error fetching goal:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'objectif' })
  }
}

export const createGoal = (req: Request, res: Response) => {
  try {
    const { title, note, start_amount, target_amount, deadline } = req.body
    
    if (!title || target_amount === undefined) {
      return res.status(400).json({ error: 'title et target_amount sont requis' })
    }
    
    if (target_amount < 0 || (start_amount !== undefined && start_amount < 0)) {
      return res.status(400).json({ error: 'Les montants doivent être >= 0' })
    }
    
    const now = Date.now()
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tGoals} 
        (title, note, start_amount, target_amount, deadline, archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `)
      .run(
        title,
        note || null,
        start_amount || 0,
        target_amount,
        deadline || null,
        now,
        now
      )
    
    const goal = db
      .prepare(`SELECT * FROM ${DbSchema.tGoals} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(goal)
  } catch (error) {
    console.error('Error creating goal:', error)
    res.status(500).json({ error: 'Erreur lors de la création de l\'objectif' })
  }
}

export const updateGoal = (req: Request, res: Response) => {
  try {
    const { title, note, start_amount, target_amount, deadline, archived } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tGoals} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Objectif non trouvé' })
    }
    
    if (target_amount !== undefined && target_amount < 0) {
      return res.status(400).json({ error: 'target_amount doit être >= 0' })
    }
    
    if (start_amount !== undefined && start_amount < 0) {
      return res.status(400).json({ error: 'start_amount doit être >= 0' })
    }
    
    const now = Date.now()
    db.prepare(`
      UPDATE ${DbSchema.tGoals}
      SET title = COALESCE(?, title),
          note = ?,
          start_amount = COALESCE(?, start_amount),
          target_amount = COALESCE(?, target_amount),
          deadline = ?,
          archived = COALESCE(?, archived),
          updated_at = ?
      WHERE id = ?
    `).run(
      title || null,
      note !== undefined ? note : null,
      start_amount !== undefined ? start_amount : null,
      target_amount !== undefined ? target_amount : null,
      deadline !== undefined ? deadline : null,
      archived !== undefined ? (archived ? 1 : 0) : null,
      now,
      parseInt(id)
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tGoals} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating goal:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'objectif' })
  }
}

export const deleteGoal = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tGoals} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Objectif non trouvé' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting goal:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'objectif' })
  }
}

