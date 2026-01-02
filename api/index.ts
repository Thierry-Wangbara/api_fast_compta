import type { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'

// Import de l'application Express
import apiRoutes from '../server/routes/index.js'

// Créer une instance Express pour Vercel
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes API (sans le préfixe /api car Vercel le gère déjà)
app.use('/', apiRoutes)

// Exporter le handler serverless
export default serverless(app)

