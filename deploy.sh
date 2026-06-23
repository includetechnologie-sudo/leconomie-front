#!/bin/bash
# Script de déploiement — Hostinger VPS
# Usage : bash deploy.sh

set -e

APP_DIR="/var/www/leconomie-front"

echo "==> Mise à jour du code..."
cd $APP_DIR
git pull origin main

echo "==> Installation des dépendances..."
npm ci --omit=dev

echo "==> Build Next.js..."
npm run build

echo "==> Redémarrage PM2..."
pm2 restart leconomie-front || pm2 start ecosystem.config.js

echo "==> Sauvegarde PM2..."
pm2 save

echo "✓ Déploiement terminé."
