#!/bin/bash
# Test build script - run this locally before deploying

echo "🔍 Checking Node version..."
node -v
npm -v

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Running build..."
npm run build

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready to deploy."
else
    echo "❌ Build failed. Check errors above."
    exit 1
fi

