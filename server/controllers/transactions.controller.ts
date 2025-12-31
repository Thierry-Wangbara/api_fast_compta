import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getTransactions = (req: Request, res: Response) => {
  try {
    const { accounting_code, kind, limit, offset } = req.query
    let query = `SELECT * FROM ${DbSchema.tTransactions} WHERE 1=1`
    const params: any[] = []
    
    if (accounting_code) {
      query += ' AND accounting_code = ?'
      params.push(accounting_code)
    }
    
    if (kind) {
      query += ' AND kind = ?'
      params.push(kind)
    }
    
    query += ' ORDER BY tx_date DESC, created_at DESC'
    
    if (limit) {
      query += ' LIMIT ?'
      params.push(parseInt(limit as string))
      
      if (offset) {
        query += ' OFFSET ?'
        params.push(parseInt(offset as string))
      }
    }
    
    const transactions = db.prepare(query).all(...params)
    res.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des transactions' })
  }
}

export const getTransaction = (req: Request, res: Response) => {
  try {
    const transaction = db
      .prepare(`SELECT * FROM ${DbSchema.tTransactions} WHERE tx_code = ?`)
      .get(req.params.tx_code)
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction non trouvée' })
    }
    
    res.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération de la transaction' })
  }
}

export const createTransaction = (req: Request, res: Response) => {
  try {
    const { accounting_code, kind, amount, label, note, category, tx_date } = req.body
    
    if (!accounting_code || !kind || amount === undefined || !label) {
      return res.status(400).json({ error: 'accounting_code, kind, amount et label sont requis' })
    }
    
    if (!['income', 'expense', 'transfer'].includes(kind)) {
      return res.status(400).json({ error: 'kind doit être: income, expense ou transfer' })
    }
    
    if (amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    // Générer un code unique pour la transaction
    const tx_code = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const now = Date.now()
    const transactionDate = tx_date || now
    
    const result = db
      .prepare(`
        INSERT INTO ${DbSchema.tTransactions} 
        (tx_code, accounting_code, kind, amount, label, note, category, tx_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        tx_code,
        accounting_code,
        kind,
        amount,
        label,
        note || null,
        category || null,
        transactionDate,
        now,
        now
      )
    
    const transaction = db
      .prepare(`SELECT * FROM ${DbSchema.tTransactions} WHERE id = ?`)
      .get(result.lastInsertRowid)
    
    res.status(201).json(transaction)
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Ce code de transaction existe déjà' })
    } else if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      res.status(400).json({ error: 'Comptabilité non trouvée' })
    } else {
      console.error('Error creating transaction:', error)
      res.status(500).json({ error: 'Erreur lors de la création de la transaction' })
    }
  }
}

export const updateTransaction = (req: Request, res: Response) => {
  try {
    const { kind, amount, label, note, category, tx_date } = req.body
    const { tx_code } = req.params
    
    const existing = db
      .prepare(`SELECT * FROM ${DbSchema.tTransactions} WHERE tx_code = ?`)
      .get(tx_code)
    
    if (!existing) {
      return res.status(404).json({ error: 'Transaction non trouvée' })
    }
    
    if (kind && !['income', 'expense', 'transfer'].includes(kind)) {
      return res.status(400).json({ error: 'kind doit être: income, expense ou transfer' })
    }
    
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ error: 'amount doit être >= 0' })
    }
    
    const now = Date.now()
    db.prepare(`
      UPDATE ${DbSchema.tTransactions}
      SET kind = COALESCE(?, kind),
          amount = COALESCE(?, amount),
          label = COALESCE(?, label),
          note = ?,
          category = ?,
          tx_date = COALESCE(?, tx_date),
          updated_at = ?
      WHERE tx_code = ?
    `).run(
      kind || null,
      amount !== undefined ? amount : null,
      label || null,
      note !== undefined ? note : null,
      category !== undefined ? category : null,
      tx_date || null,
      now,
      tx_code
    )
    
    const updated = db
      .prepare(`SELECT * FROM ${DbSchema.tTransactions} WHERE tx_code = ?`)
      .get(tx_code)
    
    res.json(updated)
  } catch (error) {
    console.error('Error updating transaction:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la transaction' })
  }
}

export const deleteTransaction = (req: Request, res: Response) => {
  try {
    const { tx_code } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tTransactions} WHERE tx_code = ?`)
      .run(tx_code)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction non trouvée' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting transaction:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression de la transaction' })
  }
}

