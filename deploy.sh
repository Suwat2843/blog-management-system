#!/bin/bash

# Blog Management System Deployment Script
echo "🚀 Starting Blog Management System Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create production environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "📝 Creating .env.production file..."
    cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production

# Database Configuration
DATABASE_URL=mysql://bloguser:blogpassword@mysql:3306/blog_db
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=blog_db
MYSQL_USER=bloguser
MYSQL_PASSWORD=blogpassword

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App Configuration
VITE_APP_TITLE=Blog Management System
VITE_APP_LOGO=https://example.com/logo.png

# OAuth (Optional)
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Info (Optional)
OWNER_NAME=Admin
OWNER_OPEN_ID=admin
EOF
    echo "✅ .env.production file created!"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose --env-file .env.production up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec app pnpm db:push

echo "✅ Deployment completed!"
echo "🌐 Your blog management system is now running at: http://localhost:3000"
echo "📊 Database is running on port 3306"
echo ""
echo "🔧 To stop the services: docker-compose down"
echo "📝 To view logs: docker-compose logs -f"
echo "🔄 To restart: docker-compose restart"
