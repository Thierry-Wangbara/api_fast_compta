# API Fast Compta

Application web de documentation et gestion d'API pour Fast Compta.

## 🚀 Démarrage rapide

### Option 1 : Docker (Production - Recommandé pour le déploiement)

Construire et lancer l'application avec Docker :

```bash
# Construire l'image Docker
docker build -t api-fast-compta .

# Lancer le conteneur
docker run -d \
  --name fast-compta \
  -p 80:80 \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  api-fast-compta
```

**Sur Windows PowerShell :**
```powershell
docker build -t api-fast-compta .
docker run -d --name fast-compta -p 80:80 -p 3001:3001 -v ${PWD}/data:/app/data api-fast-compta
```

**Accès à l'application :**
- **Frontend** : http://localhost
- **Backend API** : http://localhost/api
- **Health Check** : http://localhost/api/health

**Commandes utiles :**
```bash
# Voir les logs
docker logs fast-compta

# Voir les logs en temps réel
docker logs -f fast-compta

# Arrêter le conteneur
docker stop fast-compta

# Redémarrer le conteneur
docker start fast-compta

# Supprimer le conteneur
docker rm fast-compta

# Accéder au shell du conteneur
docker exec -it fast-compta sh
```

### Option 2 : Démarrer les deux serveurs en même temps (Développement)

```bash
npm run dev:all
```

Cette commande démarre :
- **Backend API** sur `http://localhost:3001`
- **Frontend** sur `http://localhost:5173`

### Option 3 : Démarrer séparément (Développement)

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

### Mode Développement
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001/api
- **Health Check** : http://localhost:3001/api/health

### Mode Docker/Production
- **Frontend** : http://localhost
- **Backend API** : http://localhost/api
- **Health Check** : http://localhost/api/health

## 📦 Technologies

- **Frontend** : React 19 + TypeScript + Vite
- **Backend** : Express 5 + TypeScript
- **Base de données** : SQLite (better-sqlite3)
- **Routing** : React Router DOM

## 🐳 Docker

### Architecture Docker

Le projet utilise un build multi-stage Docker pour optimiser la taille de l'image finale :

1. **Stage 1 - Frontend Builder** : Compile le frontend React/Vite
2. **Stage 2 - Backend Builder** : Compile le backend TypeScript
3. **Stage 3 - Runtime** : Image finale avec Node.js + Nginx

### Fichiers Docker

- `Dockerfile` : Configuration multi-stage pour construire l'image
- `docker-entrypoint.sh` : Script de démarrage (Nginx + Backend)
- `nginx.conf` : Configuration Nginx (reverse proxy)

### Volumes Docker

Le conteneur monte le répertoire `data/` pour persister la base de données SQLite :
- **Hôte** : `./data`
- **Conteneur** : `/app/data`

### Variables d'environnement

Le serveur backend utilise le port `3001` par défaut. Vous pouvez le modifier avec :
```bash
docker run -e PORT=3001 ...
```

## 🚢 Déploiement

### Docker

Pour déployer avec Docker, suivez les instructions dans la section [Docker](#-docker) ci-dessus.

### Vercel

Pour déployer sur Vercel, consultez le guide : [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

## ⚠️ Note importante

Le serveur backend doit être démarré pour que le frontend puisse communiquer avec l'API. Si vous voyez une erreur `ECONNREFUSED`, c'est que le backend n'est pas en cours d'exécution.

## 📚 Documentation API

La documentation complète de l'API est disponible dans l'application web à l'adresse : http://localhost:5173
