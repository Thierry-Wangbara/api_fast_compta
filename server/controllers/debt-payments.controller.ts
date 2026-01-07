import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getDebtPayments = (req: Request, res: Response) => {
  try {
    const { debt_id, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tDebtPayments} WHERE 1=1`
    const params: any[] = []
    
    if (debt_id) {
      query += ' AND debt_id = ?'
      params.push(parseInt(debt_id as string))
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
    
    const payments = db.prepare(query).all(...params)
    res.json(payments)
  } catch (error) {
    console.error('Error fetching debt payments:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des paiements' })
  }
}

export const getDebtPayment = (req: Request, res: Response) => {
  try {
    const payment = db
      .prepare(`SELECT * FROM ${DbSchema.tDebtPayments} WHERE id = ?`)
      .get(parseInt(req.params.id))
    
    if (!payment) {
      return res.status(404).json({ error: 'Paiement non trouvé' })
    }
    
    res.json(payment)
  } catch (error) {
    console.error('Error fetching debt payment:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération du paiement' })
  }
}

export const createDebtPayment = (req: Request, res: Response) => {
  try {
    const { debt_id, amount, note, occurred_at } = req.body
    
    if (!debt_id || amount === undefined) {
      return res.status(400).json({ error: 'debt_id et amount sont requis' })
    }
    
    if (amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    const now = Date.now()
    const occurred = occurred_at || now
    
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tDebtPayments} 
        (debt_id, amount, note, occurred_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        parseInt(debt_id),
        amount,
        note || null,
        occurred,
        now
      )
    
    const payment = db
      .prepare(`SELECT * FROM ${DbSchema.tDebtPayments} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(payment)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({ error: 'Dette non trouvée' })
    } else {
      console.error('Error creating debt payment:', error)
      res.status(500).json({ error: 'Erreur lors de la création du paiement' })
    }
  }
}

export const updateDebtPayment = (req: Request, res: Response) => {
  try {
    const { amount, note, occurred_at } = req.body
    const { id } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tDebtPayments} WHERE id = ?`)
      .get(parseInt(id))
    
    if (!existing) {
      return res.status(404).json({ error: 'Paiement non trouvé' })
    }
    
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    db.prepare(`
      UPDATE ${DbSchema.tDebtPayments}
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
      .prepare(`SELECT * FROM ${DbSchema.tDebtPayments} WHERE id = ?`)
      .get(parseInt(id))
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating debt payment:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du paiement' })
  }
}

export const deleteDebtPayment = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tDebtPayments} WHERE id = ?`)
      .run(parseInt(id))
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting debt payment:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression du paiement' })
  }
}



