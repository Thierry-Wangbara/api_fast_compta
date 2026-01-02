# API Fast Compta

Application web de documentation et gestion d'API pour Fast Compta.

## 🚀 Démarrage rapide

### Option 1 : Démarrer les deux serveurs en même temps (Recommandé)

```bash
npm run dev:all
```

Cette commande démarre :
- **Backend API** sur `http://localhost:3001`
- **Frontend** sur `http://localhost:5173`

### Option 2 : Démarrer séparément

**Terminal 1 - Backend :**
```bash
npm run dev:server
```

**Terminal 2 - Frontend :**
```bash
npm run dev
```

## 📋 Scripts disponibles

- `npm run dev` - Démarrer le frontend (Vite)
- `npm run dev:server` - Démarrer le serveur backend (Express)
- `npm run dev:all` - Démarrer les deux serveurs en parallèle
- `npm run build` - Build de production
- `npm run lint` - Linter le code
- `npm run preview` - Prévisualiser le build de production

## 🏗️ Structure du projet

```
api_fast_compta/
├── api/                 # Handler serverless pour Vercel
├── server/              # Serveur Express (Backend)
│   ├── controllers/     # Contrôleurs API
│   ├── routes/          # Routes API
│   └── database.ts      # Configuration SQLite
├── src/                  # Application React (Frontend)
│   ├── components/      # Composants React
│   └── pages/           # Pages de l'application
└── dist/                # Build de production
```

## 🌐 URLs

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001/api
- **Health Check** : http://localhost:3001/api/health

## 📦 Technologies

- **Frontend** : React 19 + TypeScript + Vite
- **Backend** : Express 5 + TypeScript
- **Base de données** : SQLite (better-sqlite3)
- **Routing** : React Router DOM

## 🚢 Déploiement

Pour déployer sur Vercel, consultez le guide : [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

## ⚠️ Note importante

Le serveur backend doit être démarré pour que le frontend puisse communiquer avec l'API. Si vous voyez une erreur `ECONNREFUSED`, c'est que le backend n'est pas en cours d'exécution.

## 📚 Documentation API

La documentation complète de l'API est disponible dans l'application web à l'adresse : http://localhost:5173
