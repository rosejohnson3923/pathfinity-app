#!/bin/bash

# Pathfinity Production Deployment Script
# This script automates the deployment process to production

set -e  # Exit on error

echo "🚀 Starting Pathfinity Production Deployment..."
echo "============================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Pre-deployment checks
echo -e "${YELLOW}📋 Running pre-deployment checks...${NC}"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}❌ Error: Must be on 'main' branch to deploy to production${NC}"
    echo "Current branch: $CURRENT_BRANCH"
    read -p "Do you want to switch to main branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git pull origin main
    else
        exit 1
    fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
    git status --short
    echo "Please commit or stash your changes before deploying"
    exit 1
fi

# 2. Update from remote
echo -e "${YELLOW}📥 Pulling latest changes from remote...${NC}"
git pull origin main

# 3. Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# 4. Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm test -- --passWithNoTests || {
    echo -e "${RED}❌ Tests failed. Fix issues before deploying.${NC}"
    exit 1
}

# 5. Build production bundle
echo -e "${YELLOW}🔨 Building production bundle...${NC}"
rm -rf dist
npm run build || {
    echo -e "${RED}❌ Build failed. Fix issues before deploying.${NC}"
    exit 1
}

# 6. Check build size
echo -e "${YELLOW}📊 Checking build size...${NC}"
DIST_SIZE=$(du -sh dist | cut -f1)
echo "Build size: $DIST_SIZE"

# Check if dist folder exists and has content
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo -e "${RED}❌ Error: dist folder is empty or doesn't exist${NC}"
    exit 1
fi

# 7. Deploy to hosting service
echo -e "${YELLOW}🚀 Deploying to production...${NC}"

# Check which deployment method to use
if command_exists vercel; then
    echo "Deploying with Vercel..."
    
    # Production deployment with Vercel
    vercel --prod --yes || {
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    }
    
elif command_exists netlify; then
    echo "Deploying with Netlify..."
    
    # Production deployment with Netlify
    netlify deploy --prod --dir=dist || {
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    }
    
else
    echo -e "${YELLOW}⚠️  No deployment CLI found. Please choose an option:${NC}"
    echo "1) Install Vercel CLI and deploy"
    echo "2) Install Netlify CLI and deploy"
    echo "3) Manual deployment (will open instructions)"
    echo "4) Exit"
    
    read -p "Choose option (1-4): " option
    
    case $option in
        1)
            echo "Installing Vercel CLI..."
            npm i -g vercel
            vercel --prod --yes
            ;;
        2)
            echo "Installing Netlify CLI..."
            npm i -g netlify-cli
            netlify deploy --prod --dir=dist
            ;;
        3)
            echo -e "${YELLOW}📖 Manual Deployment Instructions:${NC}"
            echo "1. Your production build is ready in the 'dist' folder"
            echo "2. Upload the contents of 'dist' to your hosting service:"
            echo "   - For AWS S3: aws s3 sync dist/ s3://your-bucket-name"
            echo "   - For Azure: az storage blob upload-batch -s dist -d \$web"
            echo "   - For GitHub Pages: Push dist folder to gh-pages branch"
            echo "   - For traditional hosting: Upload via FTP/SFTP"
            ;;
        4)
            echo "Deployment cancelled"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
fi

# 8. Create git tag for this deployment
echo -e "${YELLOW}🏷️  Creating deployment tag...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TAG_NAME="deploy_prod_$TIMESTAMP"
git tag -a "$TAG_NAME" -m "Production deployment on $(date)"
git push origin "$TAG_NAME"

# 9. Post-deployment verification
echo -e "${YELLOW}✅ Deployment complete!${NC}"
echo "============================================"
echo -e "${GREEN}✨ Production deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. ✓ Verify the deployment at your production URL"
echo "2. ✓ Check Sentry dashboard for any errors"
echo "3. ✓ Monitor performance metrics"
echo "4. ✓ Test core user flows"
echo ""
echo "Deployment tag: $TAG_NAME"
echo "Build size: $DIST_SIZE"
echo ""
echo -e "${YELLOW}📊 Remember to monitor Sentry for the next 24-48 hours${NC}"