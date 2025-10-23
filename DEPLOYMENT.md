# 🚀 Blog Management System - Deployment Guide

## 📋 Prerequisites

### **1. Server Requirements**
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Windows Server 2019+
- **RAM**: 2GB+ (4GB recommended)
- **Storage**: 10GB+ free space
- **Network**: Public IP with ports 80, 443, 3000 open

### **2. Software Requirements**
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git** (for cloning repository)

## 🛠️ Installation Methods

### **Method 1: Docker Compose (Recommended)**

#### **Step 1: Clone Repository**
```bash
git clone <your-repository-url>
cd blog-management-system
```

#### **Step 2: Configure Environment**
```bash
# Copy environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production
```

#### **Step 3: Deploy with Docker Compose**
```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh

# Windows
.\deploy.ps1
```

#### **Step 4: Manual Docker Compose**
```bash
# Build and start services
docker-compose --env-file .env.production up -d --build

# Run database migrations
docker-compose exec app pnpm db:push
```

### **Method 2: Manual Deployment**

#### **Step 1: Install Dependencies**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt-get install mysql-server
```

#### **Step 2: Setup Database**
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE blog_db;
CREATE USER 'bloguser'@'localhost' IDENTIFIED BY 'blogpassword';
GRANT ALL PRIVILEGES ON blog_db.* TO 'bloguser'@'localhost';
FLUSH PRIVILEGES;
```

#### **Step 3: Build Application**
```bash
# Install dependencies
pnpm install

# Build application
pnpm build

# Run database migrations
pnpm db:push
```

#### **Step 4: Start Application**
```bash
# Start in production
NODE_ENV=production pnpm start
```

## 🔧 Configuration

### **Environment Variables**

#### **Required Variables**
```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/blog_db

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
VITE_APP_TITLE=Blog Management System
```

#### **Optional Variables**
```env
# OAuth (if using external auth)
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# App Logo
VITE_APP_LOGO=https://example.com/logo.png

# Owner Info
OWNER_NAME=Admin
OWNER_OPEN_ID=admin
```

### **Database Configuration**

#### **MySQL Settings**
```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
bind-address = 0.0.0.0
port = 3306
max_connections = 200
innodb_buffer_pool_size = 1G
```

## 🌐 Production Setup

### **1. Domain & SSL**

#### **Using Nginx (Recommended)**
```nginx
# /etc/nginx/sites-available/blog-management
server {
    listen 80;
    server_name yourdomain.com;
    
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
    }
}
```

#### **Enable SSL with Let's Encrypt**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### **2. Process Management**

#### **Using PM2**
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'blog-management',
    script: 'dist/index.js',
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

#### **Using Systemd**
```ini
# /etc/systemd/system/blog-management.service
[Unit]
Description=Blog Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/blog-management-system
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### **3. Monitoring & Logs**

#### **Log Management**
```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f mysql

# PM2 logs
pm2 logs blog-management
```

#### **Health Check**
```bash
# Check application status
curl http://localhost:3000/api/health

# Check database connection
docker-compose exec app pnpm db:push
```

## 🔒 Security Considerations

### **1. Database Security**
```sql
-- Remove default users
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Create application user with limited privileges
CREATE USER 'bloguser'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_db.* TO 'bloguser'@'localhost';
FLUSH PRIVILEGES;
```

### **2. Application Security**
```env
# Use strong JWT secret
JWT_SECRET=your-very-long-and-random-secret-key-here

# Enable HTTPS only
NODE_ENV=production
```

### **3. Server Security**
```bash
# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh
```

## 📊 Performance Optimization

### **1. Database Optimization**
```sql
-- Add indexes for better performance
CREATE INDEX idx_blogs_author_id ON blogs(authorId);
CREATE INDEX idx_blogs_created_at ON blogs(createdAt);
CREATE INDEX idx_comments_blog_id ON comments(blogId);
```

### **2. Application Optimization**
```javascript
// Enable compression
app.use(compression());

// Set cache headers
app.use(express.static('dist/public', {
  maxAge: '1y'
}));
```

### **3. Load Balancing**
```nginx
# Nginx load balancer
upstream blog_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://blog_backend;
    }
}
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Database Connection Error**
```bash
# Check database status
docker-compose ps mysql

# Check database logs
docker-compose logs mysql

# Test connection
docker-compose exec app pnpm db:push
```

#### **2. Port Already in Use**
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### **3. Memory Issues**
```bash
# Check memory usage
docker stats

# Increase memory limits
docker-compose down
docker-compose up -d --build
```

### **Backup & Recovery**

#### **Database Backup**
```bash
# Create backup
docker-compose exec mysql mysqldump -u root -p blog_db > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u root -p blog_db < backup.sql
```

#### **Application Backup**
```bash
# Backup application files
tar -czf blog-backup-$(date +%Y%m%d).tar.gz .

# Backup database
docker-compose exec mysql mysqldump -u root -p blog_db > db-backup-$(date +%Y%m%d).sql
```

## 📈 Monitoring & Maintenance

### **1. Health Monitoring**
```bash
# Check application health
curl -f http://localhost:3000/api/health || exit 1

# Check database health
docker-compose exec mysql mysqladmin ping
```

### **2. Log Rotation**
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/blog-management

# Add configuration
/path/to/blog-management/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 www-data www-data
}
```

### **3. Updates**
```bash
# Update application
git pull origin main
pnpm install
pnpm build
docker-compose restart app

# Update database schema
pnpm db:push
```

## 🎯 Quick Start Commands

```bash
# 1. Clone repository
git clone <your-repo-url>
cd blog-management-system

# 2. Deploy with Docker
./deploy.sh  # Linux/Mac
.\deploy.ps1 # Windows

# 3. Access application
open http://localhost:3000
```

## 📞 Support

หากมีปัญหาในการ deploy สามารถติดต่อได้ที่:
- 📧 Email: support@example.com
- 💬 Discord: #support
- 📖 Documentation: https://docs.example.com

---

**Happy Deploying! 🚀**
