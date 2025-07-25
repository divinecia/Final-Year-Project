#!/bin/bash

# 🚀 HouseHelp Browser Startup Script
# This script ensures the app starts and opens automatically in browser

echo "🏠 Starting HouseHelp Application..."
echo "📦 Installing dependencies..."

# Install dependencies if not present
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🚀 Starting development server..."
echo "📱 Your app will be available at:"
echo "   Local: http://localhost:3000"
echo "   Codespace: Check the 'Ports' tab for public URL"

# Start the development server
npm run dev
