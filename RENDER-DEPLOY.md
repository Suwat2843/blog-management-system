# 🚀 Render.com Deployment Guide

## 📋 Prerequisites

- GitHub repository: https://github.com/Suwat2843/blog-management-system
- Render.com account
- Database (PostgreSQL recommended for Render.com)

## 🛠️ Step-by-Step Deployment

### **Step 1: Create Database on Render.com**

1. **Go to Render Dashboard**
   - Login to https://render.com
   - Click "New +" → "PostgreSQL"

2. **Configure Database**
   - **Name**: `blog-db`
   - **Plan**: Free (or paid for production)
   - **Region**: Choose closest to your users
   - **Database Name**: `blog_db`
   - **User**: `bloguser`
   - **Password**: Generate secure password

3. **Save Database Connection String**
   - Copy the connection string
   - Format: `postgresql://user:password@host:port/database`

### **Step 2: Create Web Service**

1. **Connect GitHub Repository**
   - Click "New +" → "Web Service"
   - Connect to GitHub
   - Select repository: `Suwat2843/blog-management-system`

2. **Configure Service Settings**
   - **Name**: `blog-management-system
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

### **Step 3: Environment Variables**

Add these environment variables in Render dashboard:

#### **Required Variables:**
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### **Optional Variables:**
```
VITE_APP_TITLE=Blog Management System
VITE_APP_LOGO=https://example.com/logo.png
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_NAME=Admin
OWNER_OPEN_ID=admin
```

### **Step 4: Database Schema Setup**

#### **Option 1: Manual Setup (Recommended)**
1. **Connect to Database**
   - Use Render database dashboard
   - Or connect via psql client

2. **Create Tables**
   ```sql
   -- Users table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     username VARCHAR(20) UNIQUE NOT NULL,
     email VARCHAR(320) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(10) DEFAULT 'user' NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
   );

   -- Blogs table
   CREATE TABLE blogs (
     id SERIAL PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     content TEXT NOT NULL,
     author_id INTEGER NOT NULL REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
   );

   -- Comments table
   CREATE TABLE comments (
     id SERIAL PRIMARY KEY,
     content TEXT NOT NULL,
     author_id INTEGER NOT NULL REFERENCES users(id),
     blog_id INTEGER NOT NULL REFERENCES blogs(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
   );
   ```

#### **Option 2: Using Drizzle (Advanced)**
1. **Add Build Script**
   ```bash
   # In package.json
   "render:build": "pnpm install && pnpm build && pnpm db:push"
   ```

2. **Update Start Script**
   ```bash
   # In package.json
   "render:start": "NODE_ENV=production node dist/index.js"
   ```

### **Step 5: Deploy**

1. **Click "Create Web Service"**
2. **Wait for Build Process**
   - Build time: ~5-10 minutes
   - Watch logs for any errors

3. **Verify Deployment**
   - Check if service is running
   - Test the URL provided by Render

### **Step 6: Custom Domain (Optional)**

1. **Add Custom Domain**
   - Go to service settings
   - Add your domain
   - Update DNS records

2. **SSL Certificate**
   - Render provides free SSL
   - Automatically configured

## 🔧 Configuration Files

### **render.yaml** (Alternative Configuration)
```yaml
services:
  - type: web
    name: blog-management-system
    env: node
    plan: free
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: blog-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
```

### **render.json** (Alternative Configuration)
```json
{
  "name": "blog-management-system",
  "type": "web",
  "env": "node",
  "plan": "free",
  "buildCommand": "pnpm install && pnpm build",
  "startCommand": "pnpm start",
  "envVars": [
    {
      "key": "NODE_ENV",
      "value": "production"
    },
    {
      "key": "DATABASE_URL",
      "fromDatabase": {
        "name": "blog-db",
        "property": "connectionString"
      }
    }
  ]
}
```

## 🚨 Troubleshooting

### **Common Issues:**

#### **1. Build Fails**
```bash
# Check logs for:
- Missing dependencies
- Build script errors
- Environment variables
```

#### **2. Database Connection Error**
```bash
# Verify:
- DATABASE_URL is correct
- Database is running
- Connection string format
```

#### **3. **Application Won't Start**
```bash
# Check:
- Start command is correct
- Port 3000 is available
- Environment variables are set
```

### **Debug Commands:**

#### **Check Logs:**
```bash
# In Render dashboard:
- Go to service
- Click "Logs" tab
- Look for error messages
```

#### **Test Database:**
```bash
# Connect to database:
psql $DATABASE_URL

# Test connection:
\dt
```

## 📊 Monitoring

### **Render Dashboard:**
- **Metrics**: CPU, Memory, Response Time
- **Logs**: Real-time application logs
- **Events**: Deployment history

### **Health Checks:**
```bash
# Test application health
curl https://your-app.onrender.com

# Test database
curl https://your-app.onrender.com/api/health
```

## 🔄 Updates

### **Automatic Deployments:**
- Push to `main` branch
- Render automatically deploys
- No manual intervention needed

### **Manual Deployments:**
1. Go to service dashboard
2. Click "Manual Deploy"
3. Select branch/commit
4. Click "Deploy"

## 💰 Pricing

### **Free Tier:**
- **Web Service**: 750 hours/month
- **Database**: 1GB storage
- **Bandwidth**: 100GB/month

### **Paid Plans:**
- **Starter**: $7/month
- **Standard**: $25/month
- **Pro**: $85/month

## 🎯 Quick Start

```bash
# 1. Push to GitHub
git add .
git commit -m "Add Render.com configuration"
git push origin main

# 2. Create service on Render.com
# 3. Set environment variables
# 4. Deploy!
```

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Support**: support@render.com

---

**Happy Deploying on Render.com! 🚀**
