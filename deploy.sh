#!/bin/bash
# deploy.sh
# Script de déploiement pour VPS (Ubuntu/Debian)
# S'assurer d'avoir les droits d'exécution: chmod +x deploy.sh

echo "🚀 Début du déploiement de Ad Creative Generator..."

# 1. Mise à jour du backend
echo "📦 Installation des dépendances Backend..."
cd api
npm install
cd ..

# 2. Build du frontend
echo "🎨 Build du Frontend (Vite)..."
cd app
npm install
npm run build
cd ..

# 3. Relancer PM2
echo "🔄 Redémarrage du serveur Node avec PM2..."
# Vérifier si l'app PM2 existe déjà
pm2 describe create-ads-api > /dev/null
if [ $? -eq 0 ]; then
  pm2 restart create-ads-api
else
  cd api
  pm2 start server.js --name "create-ads-api"
  cd ..
  pm2 save
fi

# 4. Reload Nginx (optionnel, décommenter si besoin)
# echo "🌐 Rechargement de Nginx..."
# sudo systemctl reload nginx

echo "✅ Déploiement terminé avec succès sur cre.futurvps.pro !"
