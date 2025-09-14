#!/bin/bash

# ALI ENTERPRISES - Deployment Script for Vercel
echo "🚀 ALI ENTERPRISES - Vercel Deployment Script"
echo "============================================="

# Step 1: Install Firebase
echo "📦 Installing Firebase..."
npm install firebase

# Step 2: Build the project
echo "🔨 Building the project..."
npm run build

# Step 3: Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Step 4: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Test the authentication system"
echo "3. Verify Google Sheets integration"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"