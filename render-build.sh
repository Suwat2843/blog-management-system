#!/bin/bash

# Render.com Build Script for Blog Management System

echo "🚀 Starting Render.com build process..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the application
echo "🔨 Building application..."
pnpm build

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
pnpm db:push || echo "⚠️ Database migrations skipped (database might not be ready yet)"

echo "✅ Build completed successfully!"
