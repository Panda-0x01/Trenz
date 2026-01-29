# Trenz - Production Deployment Guide

This guide will help you deploy Trenz to production with proper security, performance, and reliability configurations.

## 🚀 Quick Start

```bash
# Run the automated deployment script
node scripts/deploy-production.js
```

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Nginx (recommended)
- SSL Certificate
- Domain name

## 🔧 Environment Setup

### 1. Environment Variables

Copy `.env.production` and update with your production values:

```bash
cp .env.production .env.local
```

**Required Variables:**
- `DATABASE_URL`: Your production MySQL connection string
- `JWT_SECRET`: Strong secret for JWT tokens (min 32 characters)
- `JWT_REFRESH_SECRET`: Strong secret for refresh tokens
- `NEXTAUTH_URL`: Your production domain
- `NEXTAUTH_SECRET`: NextAuth secret

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run db:seed
```

## 🏗️ Build Process

### 1. Install Dependencies

```bash
npm ci --only=production
```

### 2. Build Application

```bash
npm run build:production
```

### 3. Start Production Server

```bash
npm run start:production
```

## 🌐 Server Configuration

### Nginx Configuration

Use the generated `nginx.conf` file:

```bash
# Copy to nginx sites
sudo cp nginx.conf /etc/nginx/sites-available/trenz
sudo ln -s /etc/nginx/sites-available/trenz /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Systemd Service

```bash
# Copy service file
sudo cp trenz-app.service /etc/systemd/system/

# Enable and start
sudo systemctl enable trenz-app
sudo systemctl start trenz-app

# Check status
sudo systemctl status trenz-app
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. File Permissions

```bash
# Set proper permissions
chmod -R 755 public/uploads
chown -R www-data:www-data public/uploads
```

## 📊 Performance Optimization

### 1. PM2 Process Manager (Alternative to systemd)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'trenz-app',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Database Optimization

```sql
-- MySQL optimization
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
```

### 3. Redis Caching (Optional)

```bash
# Install Redis
sudo apt install redis-server

# Configure in .env.production
REDIS_URL=redis://localhost:6379
```

## 📈 Monitoring & Logging

### 1. Application Logs

```bash
# View logs
sudo journalctl -u trenz-app -f

# Or with PM2
pm2 logs trenz-app
```

### 2. Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### 3. Health Check Endpoint

The app includes a health check at `/api/health`:

```bash
curl https://yourdomain.com/api/health
```

## 🔄 Deployment Updates

### 1. Zero-Downtime Deployment

```bash
#!/bin/bash
# deploy.sh

# Pull latest code
git pull origin main

# Install dependencies
npm ci --only=production

# Build application
npm run build:production

# Restart service
sudo systemctl restart trenz-app

# Check health
sleep 5
curl -f https://yourdomain.com/api/health || exit 1

echo "Deployment successful!"
```

### 2. Database Migrations

```bash
# Run migrations
npx prisma migrate deploy

# Restart application
sudo systemctl restart trenz-app
```

## 🛡️ Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u username -p database_name > backup_$DATE.sql
gzip backup_$DATE.sql

# Upload to cloud storage (optional)
aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/
```

### 2. File Backup

```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Test connection
   mysql -u username -p -h hostname database_name
   ```

3. **File upload permissions**
   ```bash
   sudo chown -R www-data:www-data public/uploads
   sudo chmod -R 755 public/uploads
   ```

4. **SSL certificate issues**
   ```bash
   # Renew Let's Encrypt
   sudo certbot renew
   
   # Test SSL
   openssl s_client -connect yourdomain.com:443
   ```

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Touch-optimized interfaces
- Hamburger menu for mobile settings
- Responsive breakpoints: mobile (xs), tablet (sm/md), desktop (lg+)

## 🎯 Production Features

- ✅ Fully responsive design
- ✅ Mobile hamburger menu
- ✅ Rate limiting
- ✅ Error handling
- ✅ Security headers
- ✅ Image optimization
- ✅ Gzip compression
- ✅ SSL/TLS support
- ✅ Health monitoring
- ✅ Logging system
- ✅ Database migrations
- ✅ File upload handling

## 📞 Support

For production support:
1. Check application logs
2. Verify database connectivity
3. Test API endpoints
4. Monitor server resources
5. Check SSL certificate validity

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**: Check logs and monitor performance
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review and rotate secrets
4. **Annually**: Renew SSL certificates (if not automated)

---

**🎉 Congratulations! Your Trenz application is now production-ready with full mobile responsiveness and hamburger menu functionality.**