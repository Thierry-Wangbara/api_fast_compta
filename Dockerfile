# ============================================
# Stage 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source du frontend
COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/

# Build le frontend
RUN npm run build

# ============================================
# Stage 2: Build Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (y compris devDependencies pour TypeScript)
RUN npm ci

# Copier le code source du backend
COPY server/ ./server/
COPY tsconfig*.json ./

# Compiler TypeScript
RUN npx tsc -p tsconfig.node.json --outDir ./dist/server

# ============================================
# Stage 3: Runtime
# ============================================
FROM node:20-alpine AS runtime

# Installer Nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copier package.json pour installer les dépendances de production
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier le backend compilé depuis le stage de build
COPY --from=backend-builder /app/dist/server ./server

# Copier les fichiers source nécessaires (pour les imports dynamiques)
COPY server/db-schema.ts ./server/
COPY server/controllers ./server/controllers
COPY server/routes ./server/routes
COPY server/utils ./server/utils

# Copier le frontend build depuis le stage frontend
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/http.d/default.conf

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data && chmod 777 /app/data

# Exposer les ports
EXPOSE 80 3001

# Script de démarrage
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

