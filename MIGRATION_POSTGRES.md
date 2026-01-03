# Migration de SQLite vers PostgreSQL pour Vercel

## ⚠️ Pourquoi SQLite ne fonctionne pas sur Vercel

SQLite avec `better-sqlite3` a plusieurs limitations sur Vercel :

1. **Système de fichiers en lecture seule** : Seul `/tmp` est accessible en écriture
2. **Données perdues** : Chaque invocation de fonction serverless est isolée
3. **Binaires natifs** : `better-sqlite3` nécessite des binaires compilés qui peuvent ne pas être compatibles
4. **Pas de persistance** : Les données dans `/tmp` sont supprimées entre les invocations

## ✅ Solution : Vercel Postgres

Vercel Postgres est une base de données PostgreSQL gérée, parfaite pour les fonctions serverless.

### Étape 1 : Créer une base Vercel Postgres

```bash
# Via CLI
vercel postgres create

# Ou via le dashboard Vercel
# https://vercel.com/dashboard → Storage → Create Database → Postgres
```

### Étape 2 : Installer les dépendances

```bash
npm install @vercel/postgres
# ou
npm install pg
```

### Étape 3 : Adapter `server/database.ts`

**Avec @vercel/postgres (recommandé) :**

```typescript
import { sql } from '@vercel/postgres'
import { createSchema } from './db-schema.js'

// Initialiser la base de données
async function initDatabase() {
  // Créer les tables si elles n'existent pas
  await createSchema(sql)
  return sql
}

export default initDatabase()
export { sql }
```

**Avec pg (plus de contrôle) :**

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Créer le schéma
async function initDatabase() {
  await createSchema(pool)
  return pool
}

export default initDatabase()
export { pool }
```

### Étape 4 : Adapter le schéma

Vous devrez convertir les requêtes SQLite en PostgreSQL :

**SQLite :**
```sql
CREATE TABLE IF NOT EXISTS accountings (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
```

**PostgreSQL :**
```sql
CREATE TABLE IF NOT EXISTS accountings (
  code VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);
```

### Étape 5 : Adapter les requêtes

**SQLite (better-sqlite3) :**
```typescript
const result = db.prepare('SELECT * FROM accountings').all()
```

**PostgreSQL (@vercel/postgres) :**
```typescript
const result = await sql`SELECT * FROM accountings`
```

**PostgreSQL (pg) :**
```typescript
const result = await pool.query('SELECT * FROM accountings')
```

### Étape 6 : Mettre à jour les contrôleurs

Tous les contrôleurs doivent être convertis en fonctions `async` :

```typescript
// Avant (SQLite)
export function getAccountings(req, res) {
  const accountings = db.prepare('SELECT * FROM accountings').all()
  res.json(accountings)
}

// Après (PostgreSQL)
export async function getAccountings(req, res) {
  const accountings = await sql`SELECT * FROM accountings`
  res.json(accountings.rows)
}
```

## 🔄 Migration des données

Si vous avez des données existantes dans SQLite :

1. **Exporter les données SQLite :**
   ```bash
   sqlite3 data/compta.db .dump > dump.sql
   ```

2. **Convertir le dump pour PostgreSQL :**
   - Remplacer `TEXT` par `VARCHAR`
   - Remplacer `INTEGER` par `INT` ou `BIGINT`
   - Adapter les syntaxes spécifiques

3. **Importer dans PostgreSQL :**
   ```bash
   psql $POSTGRES_URL < dump_converted.sql
   ```

## 📝 Variables d'environnement

Vercel ajoute automatiquement :
- `POSTGRES_URL` - URL de connexion complète
- `POSTGRES_PRISMA_URL` - Pour Prisma
- `POSTGRES_URL_NON_POOLING` - Pour les migrations

## 🧪 Tester localement

```bash
# Créer un fichier .env.local
POSTGRES_URL=postgresql://user:password@localhost:5432/compta

# Tester la connexion
npm run dev:server
```

## 📚 Ressources

- [Documentation Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [@vercel/postgres](https://github.com/vercel/storage/tree/main/packages/postgres)
- [pg (node-postgres)](https://node-postgres.com/)

## ⚡ Alternative : Service externe

Si vous préférez garder SQLite, déployez l'API sur :
- **Railway** : Supporte SQLite et PostgreSQL
- **Render** : Supporte PostgreSQL
- **Fly.io** : Supporte SQLite avec volumes persistants

Puis configurez le frontend Vercel pour pointer vers cette API externe.

