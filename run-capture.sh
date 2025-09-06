#!/bin/bash

# Pathfinity Page Capture Runner Script
# Ensures environment is ready and runs the capture

echo "🚀 Pathfinity Page Capture Setup"
echo "================================"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if puppeteer is installed
if [ ! -d "node_modules/puppeteer" ]; then
    echo "📦 Installing Puppeteer..."
    npm install puppeteer
else
    echo "✅ Puppeteer is already installed"
fi

# Check if app is running
echo "🔍 Checking if app is running on localhost:3000..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ App is running"
else
    echo "⚠️  App doesn't seem to be running on localhost:3000"
    echo "    Please start the app with: npm start"
    read -p "    Press Enter when ready, or Ctrl+C to cancel..."
fi

# Create captures directory
mkdir -p captures

# Run the capture script
echo ""
echo "📸 Starting capture process..."
echo "================================"
node capture-pages.js

# Open the captures folder when done
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Capture complete!"
    echo "📁 Opening captures folder..."
    
    # Open folder based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open captures/
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open captures/
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows
        explorer captures/
    fi
fi