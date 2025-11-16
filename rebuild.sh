#!/bin/bash
# Botwaffle Character Nexus - Complete Rebuild Script
# This script deletes everything and rebuilds from scratch

set -e  # Exit on error

echo "🔥 Botwaffle Character Nexus - Complete Rebuild"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
REPO_URL="https://github.com/Fablestarexpanse/botwaffle-character-nexus.git"
BRANCH="claude/setup-botwaffle-nexus-01TYC78H8etA5cGmwWBLvGYQ"
PROJECT_NAME="botwaffle-character-nexus"
INSTALL_DIR="$HOME/$PROJECT_NAME"

# Step 1: Delete old installation
echo "📁 Step 1: Cleaning up old installation..."
if [ -d "$INSTALL_DIR" ]; then
  echo "   Deleting $INSTALL_DIR..."
  rm -rf "$INSTALL_DIR"
  echo "   ✅ Old installation removed"
else
  echo "   ℹ️  No previous installation found"
fi
echo ""

# Step 2: Clone repository
echo "📥 Step 2: Cloning repository..."
cd "$HOME"
git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_NAME"
cd "$INSTALL_DIR"
echo "   ✅ Repository cloned from branch: $BRANCH"
echo ""

# Step 3: Install dependencies
echo "📦 Step 3: Installing dependencies..."

echo "   Installing root dependencies..."
npm install

echo "   Installing backend dependencies..."
cd backend
npm install
cd ..

echo "   Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "   ✅ All dependencies installed"
echo ""

# Step 4: Initialize database
echo "💾 Step 4: Initializing database..."
cd backend
if [ -f "db.sqlite" ]; then
  rm -f db.sqlite
  echo "   Removed old database"
fi
echo "   Database will be initialized on first server start"
cd ..
echo "   ✅ Database ready"
echo ""

# Step 5: Display completion message
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ REBUILD COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Project location: $INSTALL_DIR"
echo ""
echo "🚀 To start the application, run ONE of these commands:"
echo ""
echo "   Option 1 - Both servers (recommended):"
echo "   cd $INSTALL_DIR && npm run dev"
echo ""
echo "   Option 2 - Backend only:"
echo "   cd $INSTALL_DIR && npm run backend"
echo ""
echo "   Option 3 - Frontend only:"
echo "   cd $INSTALL_DIR && npm run frontend"
echo ""
echo "🌐 Once started:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo ""
echo "📝 Notes:"
echo "   - JanitorAI URL import requires: cd backend && npm install puppeteer"
echo "   - JSON file import works out of the box"
echo "   - Manual character creation works immediately"
echo ""
