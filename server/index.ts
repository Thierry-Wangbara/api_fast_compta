import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import './database.js' // Initialise la base de données

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes API
app.use('/api', router)

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`)
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`)
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`)
})
