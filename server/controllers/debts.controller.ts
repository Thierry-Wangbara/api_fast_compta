import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getDebts = (req: Request, res: Response) => {
  try {
    const { type, closed, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tDebts} WHERE 1=1`
    const params: any[] = []
    
    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }
    
    if (closed !== undefined) {
      query += ' AND closed = ?'
      params.push(closed === 'true' ? 1 : 0)
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
    
    const debts = db.prepare(query).all(...params)
    res.json(debts)
  } catch (error) {
    console.error('Error fetching debts:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des dettes' })
  }
}

export const getDebt = (req: Request, res: Response) => {
  try {
    const debt = db
      .prepare(`SELECT * FROM ${DbSchema.tDebts} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!debt) {
      return res.status(404).json({ error: 'Dette non trouvée' })
    }
    
    res.json(debt)
  } catch (error) {
    console.error('Error fetching debt:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de la dette' })
  }
}

export const createDebt = (req: Request, res: Response) => {
  try {
    const { type, name, lender, note, principal_amount, remaining_amount, due_date } = req.body
    
    if (!name || principal_amount === undefined || remaining_amount === undefined) {
      return res.status(400).json({ error: 'name, principal_amount et remaining_amount sont requis' })
    }
    
    if (!type || !['debt', 'credit'].includes(type)) {
      return res.status(400).json({ error: 'type doit être: debt ou credit' })
    }
    
    if (principal_amount < 0 || remaining_amount < 0) {
      return res.status(400).json({ error: 'Les montants doivent être >= 0' })
    }
    
    if (remaining_amount > principal_amount) {
      return res.status(400).json({ error: 'remaining_amount ne peut pas être supérieur à principal_amount' })
    }
    
    const now = Date.now()
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tDebts} 
        (type, name, lender, note, principal_amount, remaining_amount, due_date, closed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `)
      .run(
        type || 'debt',
        name,
        lender || null,
        note || null,
        principal_amount,
        remaining_amount,
        due_date || null,
        now,
        now
      )
    
    const debt = db
      .prepare(`SELECT * FROM ${DbSchema.tDebts} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(debt)
  } catch (error) {
    console.error('Error creating debt:', error)
    res.status(500).json({ error: 'Erreur lors de la création de la dette' })
  }
}

export const updateDebt = (req: Request, res: Response) => {
  try {
    const { name, lender, note, principal_amount, remaining_amount, due_date, closed } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tDebts} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Dette non trouvée' })
    }
    
    if (principal_amount !== undefined && principal_amount < 0) {
      return res.status(400).json({ error: 'principal_amount doit être >= 0' })
    }
    
    if (remaining_amount !== undefined && remaining_amount < 0) {
      return res.status(400).json({ error: 'remaining_amount doit être >= 0' })
    }
    
    const now = Date.now()
    db.prepare(`
      UPDATE ${DbSchema.tDebts}
      SET name = COALESCE(?, name),
          lender = ?,
          note = ?,
          principal_amount = COALESCE(?, principal_amount),
          remaining_amount = COALESCE(?, remaining_amount),
          due_date = ?,
          closed = COALESCE(?, closed),
          updated_at = ?
      WHERE id = ?
    `).run(
      name || null,
      lender !== undefined ? lender : null,
      note !== undefined ? note : null,
      principal_amount !== undefined ? principal_amount : null,
      remaining_amount !== undefined ? remaining_amount : null,
      due_date !== undefined ? due_date : null,
      closed !== undefined ? (closed ? 1 : 0) : null,
      now,
      parseInt(id)
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tDebts} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating debt:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la dette' })
  }
}

export const deleteDebt = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tDebts} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Dette non trouvée' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting debt:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de la dette' })
  }
}

