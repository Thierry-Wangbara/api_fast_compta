#!/bin/sh
set -e

echo "🚀 Démarrage de l'application Fast Compta..."

# Démarrer Nginx en arrière-plan
echo "📦 Démarrage de Nginx..."
nginx

# Attendre un peu pour que Nginx démarre
sleep 1

# Démarrer le serveur backend Node.js
echo "🔧 Démarrage du serveur backend..."
cd /app
node server/index.js &

# Attendre que les processus soient terminés
wait

