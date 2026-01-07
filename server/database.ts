import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'
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
const isVercel = !!process.env.VERCEL
const baseDir = isVercel ? '/tmp' : join(__dirname, '../data')

// Assure que le dossier existe
mkdirSync(baseDir, { recursive: true })

// Chemin vers la base SQLite
const dbPath = join(baseDir, 'compta.db')

// Initialiser la base de données
const db = new Database(dbPath)

// Activer les clés étrangères
db.pragma('foreign_keys = ON')

// (Optionnel mais souvent utile) meilleures perf/concurrence
// db.pragma('journal_mode = WAL')

// Créer le schéma de base de données
createSchema(db)

export default db
export { DbSchema } from './db-schema.js'
