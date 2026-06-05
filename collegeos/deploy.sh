#!/bin/bash

# CollegeOS Deployment Quick Start
# This script guides you through the deployment process

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║          CollegeOS Deployment Quick Start Guide                   ║"
echo "║          Deploy on Render, Vercel, and Neon                       ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

echo "✅ Git installed"
echo "✅ npm installed"
echo ""

# Get GitHub repo info
read -p "📌 Enter your GitHub repository URL (e.g., https://github.com/username/collegeos): " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    echo "❌ GitHub URL cannot be empty"
    exit 1
fi

echo ""
echo "🔧 Setup Instructions:"
echo ""

# 1. Neon Setup
echo "═══════════════════════════════════════════════════════════════════════"
echo "STEP 1: Set Up Database on Neon (https://console.neon.tech)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Create a new project in Neon"
echo "2. Copy the PostgreSQL connection string"
echo "3. Go to SQL Editor in Neon"
echo "4. Run the contents of: collegeos/database/schema.sql"
echo "5. Save your connection string - you'll need it soon"
echo ""
read -p "Press Enter when you've completed Neon setup..."

read -p "📌 Enter your Neon Database URL (postgresql://...): " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Database URL cannot be empty"
    exit 1
fi

echo ""

# 2. JWT Secret
echo "═══════════════════════════════════════════════════════════════════════"
echo "STEP 2: Generate JWT Secret"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

if command -v openssl &> /dev/null; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT Secret: $JWT_SECRET"
else
    echo "⚠️  OpenSSL not found. Generate a random 32-character string manually"
    read -p "📌 Enter your JWT Secret: " JWT_SECRET
fi

echo ""

# 3. Render Setup
echo "═══════════════════════════════════════════════════════════════════════"
echo "STEP 3: Deploy Backend on Render (https://render.com)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to https://render.com"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Select 'Connect a repository' and choose your GitHub repo"
echo "4. Fill in:"
echo "   - Name: collegeos-backend"
echo "   - Environment: Node"
echo "   - Build Command: cd backend && npm install && npm run build"
echo "   - Start Command: cd backend && npm start"
echo ""
echo "5. Add Environment Variables:"
echo "   - DATABASE_URL=$DATABASE_URL"
echo "   - JWT_SECRET=$JWT_SECRET"
echo "   - NODE_ENV=production"
echo "   - CLIENT_URL=(will add after Vercel deployment)"
echo ""
echo "6. Click 'Create Web Service' and wait for deployment"
echo ""
read -p "Press Enter when you've deployed on Render..."

read -p "📌 Enter your Render Backend URL (https://...onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL cannot be empty"
    exit 1
fi

echo ""

# 4. Vercel Setup
echo "═══════════════════════════════════════════════════════════════════════"
echo "STEP 4: Deploy Frontend on Vercel (https://vercel.com)"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to https://vercel.com"
echo "2. Click 'Add New' → 'Project'"
echo "3. Select 'Import Git Repository'"
echo "4. Choose your GitHub repository"
echo "5. Fill in:"
echo "   - Framework Preset: Vite"
echo "   - Root Directory: ./frontend"
echo ""
echo "6. Add Environment Variable:"
echo "   - VITE_API_URL=$BACKEND_URL"
echo ""
echo "7. Click 'Deploy' and wait for completion"
echo ""
read -p "Press Enter when you've deployed on Vercel..."

read -p "📌 Enter your Vercel Frontend URL (https://...vercel.app): " FRONTEND_URL

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Frontend URL cannot be empty"
    exit 1
fi

echo ""

# 5. Update Render with Frontend URL
echo "═══════════════════════════════════════════════════════════════════════"
echo "STEP 5: Update Render with Frontend URL"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Go back to https://render.com"
echo "2. Open 'collegeos-backend' service"
echo "3. Click 'Environment'"
echo "4. Update CLIENT_URL = $FRONTEND_URL"
echo "5. Click 'Save Changes' (service will redeploy)"
echo ""
read -p "Press Enter when you've updated Render..."

echo ""

# 6. Verification
echo "═══════════════════════════════════════════════════════════════════════"
echo "STEP 6: Verify Deployment"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Testing backend health endpoint..."

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health" 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Backend health check passed!"
else
    echo "⚠️  Backend health check failed (HTTP $HEALTH_CHECK)"
fi

echo ""
echo "🔍 Testing frontend accessibility..."

FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")

if [ "$FRONTEND_CHECK" = "200" ]; then
    echo "✅ Frontend is accessible!"
else
    echo "⚠️  Frontend check returned HTTP $FRONTEND_CHECK"
fi

echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Deployment Summary:"
echo ""
echo "  Database (Neon):"
echo "    $DATABASE_URL"
echo ""
echo "  Backend (Render):"
echo "    $BACKEND_URL"
echo ""
echo "  Frontend (Vercel):"
echo "    $FRONTEND_URL"
echo ""
echo "🚀 Your app is live! Open $FRONTEND_URL in your browser."
echo ""
echo "📚 For troubleshooting, see DEPLOYMENT.md"
echo ""
