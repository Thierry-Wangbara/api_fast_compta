import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, existsSync } from 'fs'
import { createSchema } from './db-schema.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Vercel (serverless) :
 * - filesystem du projet = read-only
 * - seul /tmp est writable
 * Donc en prod, on écrit dans /tmp.
 * En local/dev, on peut utiliser ../data.
 */
const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV
const baseDir = isVercel ? '/tmp' : join(__dirname, '../data')

// Assure que le dossier existe
try {
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true })
  }
} catch (error) {
  console.error(`Erreur lors de la création du répertoire ${baseDir}:`, error)
  // En cas d'erreur, on essaie quand même de continuer
}

// Chemin vers la base SQLite
const dbPath = join(baseDir, 'compta.db')

let db: Database.Database

try {
  // Initialiser la base de données
  db = new Database(dbPath)
  
  // Activer les clés étrangères
  db.pragma('foreign_keys = ON')
  
  // (Optionnel mais souvent utile) meilleures perf/concurrence
  // db.pragma('journal_mode = WAL')
  
  // Créer le schéma de base de données
  createSchema(db)
  
  if (isVercel) {
    console.warn('⚠️  SQLite sur Vercel : Les données seront perdues entre les invocations serverless.')
    console.warn('⚠️  Recommandation : Migrez vers Vercel Postgres ou un service externe.')
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation de la base de données:', error)
  throw new Error(
    `Impossible d'initialiser la base de données SQLite. ` +
    `Sur Vercel, SQLite n'est pas recommandé. ` +
    `Veuillez migrer vers PostgreSQL ou un service externe. ` +
    `Erreur: ${error instanceof Error ? error.message : String(error)}`
  )
}

export default db
export { DbSchema } from './db-schema.js'
