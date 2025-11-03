# Guide de Déploiement Production - Admin Panel Oliver

## Pré-requis

- [ ] DNS `admin.oliver.com` pointant vers IP du serveur
- [ ] Serveur Linux (Ubuntu 22.04 recommandé)
- [ ] PostgreSQL 14+
- [ ] Node.js 18+
- [ ] Nginx
- [ ] Certbot (Let's Encrypt)
- [ ] Redis

## Étapes de Déploiement

### 1. Vérifier DNS

```bash
nslookup admin.oliver.com
# Doit renvoyer l'IP de votre serveur
```

### 2. Installer les dépendances

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Nginx
sudo apt install nginx

# Certbot
sudo apt install certbot python3-certbot-nginx

# Redis
sudo apt install redis-server
sudo systemctl enable redis-server
```

### 3. Créer la base de données

```bash
sudo -u postgres psql

CREATE DATABASE oliver_admin_prod;
CREATE USER oliver_admin WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE oliver_admin_prod TO oliver_admin;
\q
```

### 4. Configurer Nginx

```bash
# Copier la config depuis docs/NGINX_CONFIG.md
sudo nano /etc/nginx/sites-available/admin.oliver.com

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/admin.oliver.com /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

### 5. Obtenir certificat SSL

```bash
sudo certbot --nginx -d admin.oliver.com
```

### 6. Configurer les variables d'environnement

```bash
# API
cp apps/api/.env.production apps/api/.env

# Générer JWT_SECRET
node scripts/generate-jwt-secret.js
# Copier le JWT_SECRET généré dans apps/api/.env

# Mettre à jour DATABASE_URL dans apps/api/.env
# DATABASE_URL="postgresql://oliver_admin:VOTRE_MOT_DE_PASSE@localhost:5432/oliver_admin_prod?schema=public"

# Frontend
cp apps/web/.env.production apps/web/.env
```

### 7. Build & Deploy

```bash
# Installer les dépendances
pnpm install

# API - Migrations
cd apps/api
pnpm prisma migrate deploy
pnpm prisma generate

# Seed admin (si nécessaire)
pnpm prisma db seed

# Build API
pnpm build

# Build Frontend
cd ../web
pnpm build
```

### 8. Configurer PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer API
cd apps/api
pm2 start dist/main.js --name oliver-api

# Démarrer Frontend
cd ../web
pm2 start npm --name oliver-web -- start

# Sauvegarder la config PM2
pm2 save
pm2 startup
```

### 9. Vérifier le déploiement

```bash
# Tester l'accès HTTPS
curl https://admin.oliver.com/api/health

# Vérifier les logs
pm2 logs oliver-api
pm2 logs oliver-web

# Tester login admin
# https://admin.oliver.com/admin/login
# Email: admin@oliver.com
# Password: Admin123!
```

### 10. Post-Déploiement Sécurité

**Checklist sécurité :**

- [ ] Vérifier que BYPASS_IP_WHITELIST=false dans .env
- [ ] Vérifier que BYPASS_GEO_BLOCKING=false dans .env
- [ ] Ajouter votre IP dans la whitelist via /admin/security/ip-management
- [ ] Activer 2FA pour le compte admin via /admin/security/2fa-setup
- [ ] Vérifier logs de sessions via /admin/security/sessions
- [ ] Tester rate limiting (4+ tentatives login)
- [ ] Vérifier headers sécurité (DevTools Network)

**Firewall (UFW) :**

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## Commandes Utiles

### PM2

```bash
# Voir les logs en temps réel
pm2 logs oliver-api --lines 100

# Redémarrer un service
pm2 restart oliver-api
pm2 restart oliver-web

# Monitoring
pm2 monit

# Liste des process
pm2 list
```

### Nginx

```bash
# Voir les logs d'accès
sudo tail -f /var/log/nginx/access.log

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/error.log

# Recharger config
sudo systemctl reload nginx
```

## Rollback

En cas de problème :

```bash
# Arrêter les services
pm2 stop oliver-api
pm2 stop oliver-web

# Restaurer base de données (si backup disponible)
psql -U oliver_admin -d oliver_admin_prod < backup.sql

# Redémarrer ancienne version
pm2 restart oliver-api
pm2 restart oliver-web
```

## Monitoring Production

- **Logs API :** `/var/log/oliver/audit/security-*.log`
- **Logs Nginx :** `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **Métriques :** `https://admin.oliver.com/api/metrics`
- **Health checks :** `https://admin.oliver.com/api/health`

## Support

En cas de problème, vérifier :

1. Logs PM2 : `pm2 logs`
2. Logs Nginx : `sudo tail -f /var/log/nginx/error.log`
3. Status PostgreSQL : `sudo systemctl status postgresql`
4. Status Redis : `sudo systemctl status redis-server`
5. Connexion DB : `psql -U oliver_admin -d oliver_admin_prod`
