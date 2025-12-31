import Database from 'better-sqlite3'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { mkdirSync } from 'fs'
import { createSchema } from './db-schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chemin vers la base de données SQLite
const dbPath = join(__dirname, '../data', 'compta.db')

// Créer le dossier data s'il n'existe pas
try {
  mkdirSync(join(__dirname, '../data'), { recursive: true })
} catch (error) {
  // Le dossier existe déjà
}

// Initialiser la base de données
const db = new Database(dbPath)

// Activer les clés étrangères
db.pragma('foreign_keys = ON')

// Créer le schéma de base de données
createSchema(db)

export default db
export { DbSchema } from './db-schema.js'

