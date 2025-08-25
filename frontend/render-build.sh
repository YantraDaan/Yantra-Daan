#!/bin/bash
set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Verify the dist directory exists
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "📁 dist directory found with contents:"
    ls -la dist/
    echo "🎉 Build completed successfully!"
else
    echo "❌ dist directory not found!"
    echo "Current directory contents:"
    ls -la
    exit 1
fi
