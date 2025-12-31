import { Request, Response } from 'express'
import db, { DbSchema } from '../database.js'

export const getSettings = (req: Request, res: Response) => {
  try {
    const settings = db
      .prepare(`SELECT * FROM ${DbSchema.tAppSettings}`)
      .all()
    
    const settingsObj: Record<string, string> = {}
    for (const setting of settings) {
      settingsObj[setting.key] = setting.value
    }
    
    res.json(settingsObj)
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' })
  }
}

export const getSetting = (req: Request, res: Response) => {
  try {
    const setting = db
      .prepare(`SELECT * FROM ${DbSchema.tAppSettings} WHERE key = ?`)
      .get(req.params.key)
    
    if (!setting) {
      return res.status(404).json({ error: 'Paramètre non trouvé' })
    }
    
    res.json({ key: setting.key, value: setting.value })
  } catch (error) {
    console.error('Error fetching setting:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération du paramètre' })
  }
}

export const createSetting = (req: Request, res: Response) => {
  try {
    const { key, value } = req.body
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'key et value sont requis' })
    }
    
    const now = Date.now()
    try {
      db.prepare(`
        INSERT INTO ${DbSchema.tAppSettings} (key, value, updated_at)
        VALUES (?, ?, ?)
      `).run(key, value, now)
      
      const setting = db
        .prepare(`SELECT * FROM ${DbSchema.tAppSettings} WHERE key = ?`)
        .get(key)
      
      res.status(201).json(setting)
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        res.status(409).json({ error: 'Ce paramètre existe déjà' })
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('Error creating setting:', error)
    res.status(500).json({ error: 'Erreur lors de la création du paramètre' })
  }
}

export const updateSetting = (req: Request, res: Response) => {
  try {
    const { value } = req.body
    
    if (value === undefined) {
      return res.status(400).json({ error: 'value est requis' })
    }
    
    const now = Date.now()
    db.prepare(`
      INSERT INTO ${DbSchema.tAppSettings} (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
    `).run(req.params.key, value, now, value, now)
    
    const setting = db
      .prepare(`SELECT * FROM ${DbSchema.tAppSettings} WHERE key = ?`)
      .get(req.params.key)
    
    res.json(setting)
  } catch (error) {
    console.error('Error updating setting:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du paramètre' })
  }
}

export const deleteSetting = (req: Request, res: Response) => {
  try {
    const { key } = req.params
    
    const result = db
      .prepare(`DELETE FROM ${DbSchema.tAppSettings} WHERE key = ?`)
      .run(key)
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Paramètre non trouvé' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting setting:', error)
    res.status(500).json({ error: 'Erreur lors de la suppression du paramètre' })
  }
}

