# Blog Management System Deployment Script for Windows
Write-Host "🚀 Starting Blog Management System Deployment..." -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create production environment file if it doesn't exist
if (!(Test-Path ".env.production")) {
    Write-Host "📝 Creating .env.production file..." -ForegroundColor Yellow
    @"
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
"@ | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "✅ .env.production file created!" -ForegroundColor Green
}

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose --env-file .env.production up -d --build

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
docker-compose exec app pnpm db:push

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your blog management system is now running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 Database is running on port 3306" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 To stop the services: docker-compose down" -ForegroundColor Yellow
Write-Host "📝 To view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "🔄 To restart: docker-compose restart" -ForegroundColor Yellow
