import type { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'

// Créer une instance Express pour Vercel
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Middleware de gestion d'erreur pour SQLite
app.use((req, res, next) => {
  // Avertissement sur les limitations SQLite sur Vercel
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    console.warn('⚠️  SQLite sur Vercel : Les données ne persisteront pas entre les invocations.')
  }
  next()
})

// Import de l'application Express
// Note: En cas d'erreur de base de données, elle sera gérée par les routes
import apiRoutes from '../server/routes/index.js'

// Routes API (sans le préfixe /api car Vercel le gère déjà)
app.use('/', apiRoutes)

// Handler d'erreur global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur API:', err)
  res.status(500).json({
    status: 'error',
    message: err.message || 'Erreur serveur',
    ...(process.env.VERCEL && {
      note: 'SQLite n\'est pas recommandé sur Vercel. Migrez vers PostgreSQL.'
    })
  })
})

// Exporter le handler serverless
export default serverless(app)

