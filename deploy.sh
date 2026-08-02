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
npx pm2 describe create-ads-api > /dev/null
if [ $? -eq 0 ]; then
  npx pm2 restart create-ads-api
else
  cd api
  npx pm2 start server.js --name "create-ads-api"
  cd ..
  npx pm2 save
fi

# 4. Configuration Nginx
echo "🌐 Configuration de Nginx..."
cp nginx.example.conf /etc/nginx/sites-available/crea_ads
ln -sf /etc/nginx/sites-available/crea_ads /etc/nginx/sites-enabled/
systemctl reload nginx

# 5. Configuration SSL (Certbot)
echo "🔒 Configuration du certificat SSL avec Certbot..."
# Si certbot n'est pas installé, l'installer
if ! command -v certbot &> /dev/null; then
    apt update && apt install -y certbot python3-certbot-nginx
fi
# Générer le certificat SSL de manière non-interactive
certbot --nginx -d crea.futurvps.pro --non-interactive --agree-tos --register-unsafely-without-email

echo "✅ Déploiement terminé avec succès sur https://crea.futurvps.pro !"
