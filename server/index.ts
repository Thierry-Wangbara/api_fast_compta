import express from 'express'
import cors from 'cors'
import db from './database.js'
import apiRoutes from './routes/index.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes API
app.use('/api', apiRoutes)

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🚀 Serveur API démarré avec succès !`)
  console.log(`${'='.repeat(60)}`)
  console.log(`📍 URL: http://localhost:${PORT}`)
  console.log(`📊 Base de données SQLite: data/compta.db`)
  console.log(`\n📋 Endpoints principaux:`)
  console.log(`   GET  /api/health - Vérifier l'état de l'API`)
  console.log(`   POST /api/uid - Générer un UID unique`)
  console.log(`   GET  /api/accountings - Liste des comptabilités`)
  console.log(`   GET  /api/transactions - Liste des transactions`)
  console.log(`   GET  /api/settings - Paramètres de l'application`)
  console.log(`\n✅ Testez l'API: http://localhost:${PORT}/api/health`)
  console.log(`${'='.repeat(60)}\n`)
})
