# Guide de déploiement sur Vercel

Ce guide explique comment déployer votre application Fast Compta (frontend + API) sur Vercel.

## ⚠️ Important : SQLite ne fonctionne PAS sur Vercel

**SQLite avec `better-sqlite3` ne fonctionne PAS sur Vercel** car :
- Les fonctions serverless sont éphémères (pas de système de fichiers persistant)
- `better-sqlite3` nécessite des binaires natifs qui peuvent ne pas être compatibles
- Chaque invocation de fonction est isolée
- Même avec `/tmp`, les données sont perdues entre les invocations

**➡️ Solution obligatoire : Migrez vers PostgreSQL** (voir [MIGRATION_POSTGRES.md](./MIGRATION_POSTGRES.md))

### Solutions alternatives :

1. **Utiliser Vercel Postgres** (recommandé)
   - Base de données PostgreSQL gérée par Vercel
   - Gratuit jusqu'à 256 MB
   - Parfait pour les fonctions serverless

2. **Utiliser un service externe pour l'API**
   - Déployer l'API sur Railway, Render, ou Fly.io
   - Garder le frontend sur Vercel
   - Utiliser une base de données PostgreSQL ou MySQL

3. **Utiliser Vercel KV (Redis)** pour le cache
   - Pour des données temporaires

## 📋 Prérequis

1. Compte Vercel (gratuit) : https://vercel.com
2. CLI Vercel installée : `npm i -g vercel`
3. Git repository (GitHub, GitLab, ou Bitbucket)

## 🚀 Déploiement

### Option 1 : Via l'interface Vercel (Recommandé)

1. **Connecter votre repository**
   - Allez sur https://vercel.com
   - Cliquez sur "Add New Project"
   - Importez votre repository Git

2. **Configuration du projet**
   - Framework Preset : **Vite**
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Install Command : `npm install`

3. **Variables d'environnement** (si nécessaire)
   - Ajoutez vos variables dans "Environment Variables"
   - Exemple : `DATABASE_URL`, `PORT`, etc.

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel va automatiquement détecter `vercel.json`

### Option 2 : Via CLI

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

## 📁 Structure des fichiers

```
api/
  └── index.ts          # Handler serverless pour l'API
server/
  └── ...               # Code de l'API Express
vercel.json             # Configuration Vercel
package.json            # Contient "engines": { "node": "20.x" }
```

## ⚙️ Configuration

### vercel.json
- **Simplifié** : Vercel détecte automatiquement les fonctions dans `api/`
- **Framework** : Vite pour le frontend
- **Rewrites** : Routes `/api/*` vers la fonction serverless

### package.json
- **engines** : Spécifie Node.js 20.x (Vercel utilise cette version automatiquement)

## 🔧 Configuration

Le fichier `vercel.json` configure :
- **Frontend** : Build Vite → `dist/`
- **API** : Routes `/api/*` → `api/index.ts`
- **Rewrites** : Redirection des requêtes API

## 🌐 URLs après déploiement

Après le déploiement, vous obtiendrez :
- **Frontend** : `https://votre-projet.vercel.app`
- **API** : `https://votre-projet.vercel.app/api/health`

## 🔄 Migration vers PostgreSQL (Recommandé)

Pour utiliser PostgreSQL au lieu de SQLite :

1. **Créer une base Vercel Postgres**
   ```bash
   vercel postgres create
   ```

2. **Installer le client PostgreSQL**
   ```bash
   npm install @vercel/postgres
   # ou
   npm install pg
   ```

3. **Adapter `server/database.ts`**
   ```typescript
   import { sql } from '@vercel/postgres'
   // Remplacer les requêtes SQLite par PostgreSQL
   ```

4. **Variables d'environnement**
   - `POSTGRES_URL` sera automatiquement ajouté par Vercel

## 🧪 Tester localement avec Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Tester en local
vercel dev
```

Cela démarre :
- Frontend sur `http://localhost:3000`
- API sur `http://localhost:3000/api`

## 📝 Notes importantes

1. **Cold Start** : La première requête peut être lente (cold start)
2. **Timeout** : Les fonctions serverless ont un timeout (10s sur le plan gratuit)
3. **Base de données** : SQLite ne persistera pas entre les invocations
4. **Fichiers** : Le système de fichiers est en lecture seule (sauf `/tmp`)

## 🆘 Dépannage

### Erreur : "Module not found"
- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez les imports (chemins relatifs)

### Erreur : "Database connection failed"
- SQLite ne fonctionne pas sur Vercel
- Migrez vers PostgreSQL ou un service externe

### API ne répond pas
- Vérifiez `vercel.json` et les routes
- Vérifiez les logs dans le dashboard Vercel

## 🔗 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Serverless Functions](https://vercel.com/docs/functions)

