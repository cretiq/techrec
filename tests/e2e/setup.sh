#!/bin/bash

# TechRec E2E Testing Setup Script
# Run this script to set up E2E testing on a new environment

set -e

echo "🎭 Setting up TechRec E2E Testing with Playwright"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

# Create test-results directory
echo "📁 Creating test-results directory..."
mkdir -p test-results/html
mkdir -p test-results

# Check if dev server is running
echo "🔍 Checking if development server is available..."
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Development server is running on localhost:3000"
else
    echo "⚠️  Development server is not running on localhost:3000"
    echo "   Please start it with: npm run dev"
    echo "   E2E tests require the app to be running locally"
fi

echo ""
echo "🎉 E2E Testing setup complete!"
echo ""
echo "Quick start commands:"
echo "  npm run test:e2e help        # Show all available test configurations"
echo "  npm run test:e2e fr23        # Test Project Enhancement (FR 23)"
echo "  npm run test:e2e fr24        # Test Project Ideas Generation (FR 24)"
echo "  npm run test:e2e headed      # Run tests with visible browser"
echo "  npm run test:e2e ui          # Interactive test runner"
echo ""
echo "Make sure your development server is running (npm run dev) before running tests!"
echo "" 