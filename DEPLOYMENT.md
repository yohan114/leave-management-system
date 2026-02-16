# Production Deployment Guide - Ubuntu VPS

This guide will help you deploy the Leave Management System to an Ubuntu VPS.

## Prerequisites

- Ubuntu 20.04+ VPS
- Root or sudo access
- Domain name (optional, but recommended for SSL)

---

## Step 1: Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential

# Create a deployment user (optional but recommended)
sudo adduser deploy
sudo usermod -aG sudo deploy
```

---

## Step 2: Install Bun (or Node.js)

### Option A: Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### Option B: Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## Step 3: Install and Configure SQLite

```bash
sudo apt install -y sqlite3
```

---

## Step 4: Clone and Setup Application

```bash
# Navigate to web directory
cd /var/www

# Clone the repository
sudo git clone https://github.com/yohan114/leave-management-system.git
sudo chown -R $USER:$USER /var/www/leave-management-system

# Navigate to project
cd /var/www/leave-management-system

# Install dependencies
bun install
# OR
npm install

# Create .env file
cp .env.example .env
```

---

## Step 5: Configure Environment Variables

Edit the `.env` file:

```bash
nano .env
```

Update with production values:

```env
# Database
DATABASE_URL=file:/var/www/leave-management-system/db/production.db

# NextAuth Configuration
# Generate a secure secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-very-secure-secret-key-at-least-32-characters-long
NEXTAUTH_URL=https://your-domain.com
```

---

## Step 6: Initialize Database

```bash
# Generate Prisma client
bun run db:generate
# OR
npx prisma generate

# Push database schema
bun run db:push
# OR
npx prisma db push

# Seed initial data
bun prisma/seed.ts
# OR
npx ts-node prisma/seed.ts
```

---

## Step 7: Build the Application

```bash
# Build for production
bun run build
# OR
npm run build
```

---

## Step 8: Install and Configure PM2

PM2 keeps your application running and restarts it on crashes.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application
cd /var/www/leave-management-system
pm2 start npm --name "leave-management" -- start

# Save PM2 configuration
pm2 save

# Configure PM2 to start on boot
pm2 startup
# Run the command it outputs
```

### Useful PM2 Commands
```bash
pm2 status                 # Check status
pm2 logs leave-management  # View logs
pm2 restart leave-management
pm2 stop leave-management
pm2 delete leave-management
```

---

## Step 9: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create configuration
sudo nano /etc/nginx/sites-available/leave-management
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Logging
    access_log /var/log/nginx/leave-management.access.log;
    error_log /var/log/nginx/leave-management.error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Serve static files directly (optional optimization)
    location /_next/static {
        alias /var/www/leave-management-system/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
}
```

**Important**: Replace `your-domain.com` with your actual domain name!

Enable the site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/leave-management /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 10: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 11: Configure Firewall

```bash
# Allow necessary ports
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable
```

---

## Step 12: Update Package.json for Production

Make sure your `package.json` has the correct start script:

```json
{
  "scripts": {
    "start": "NODE_ENV=production node .next/standalone/server.js"
  }
}
```

---

## Deployment Summary

Your application should now be running at: `https://your-domain.com`

### File Structure on Server
```
/var/www/leave-management-system/
├── .env                    # Environment variables
├── db/
│   └── production.db       # SQLite database
├── .next/                  # Built application
├── prisma/
│   └── schema.prisma
└── ...
```

---

## Maintenance Commands

### Update Application
```bash
cd /var/www/leave-management-system

# Pull latest changes
git pull origin main

# Install new dependencies
bun install

# Run migrations if needed
bun run db:push

# Rebuild
bun run build

# Restart PM2
pm2 restart leave-management
```

### Backup Database
```bash
# Create backup
sqlite3 /var/www/leave-management-system/db/production.db ".backup /backup/leave-management-$(date +%Y%m%d).db"

# Or copy the file
cp /var/www/leave-management-system/db/production.db /backup/leave-management-$(date +%Y%m%d).db
```

### View Logs
```bash
# Application logs
pm2 logs leave-management

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
```

### Permission issues
```bash
sudo chown -R www-data:www-data /var/www/leave-management-system
sudo chmod -R 755 /var/www/leave-management-system
```

### Database locked error
```bash
# Stop the app
pm2 stop leave-management

# Check for SQLite processes
lsof /var/www/leave-management-system/db/production.db

# Restart
pm2 start leave-management
```

---

## Security Checklist

- [ ] Changed default SSH port (optional)
- [ ] Disabled root login
- [ ] Configured firewall (UFW)
- [ ] Installed SSL certificate
- [ ] Set secure NEXTAUTH_SECRET (32+ characters)
- [ ] Regular database backups configured
- [ ] Automatic security updates enabled
