#!/bin/bash

echo "🚀 TechRec Reliable E2E Testing Demo"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if dev server is running
echo -e "${BLUE}📍 Checking if dev server is running...${NC}"
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Dev server is running on localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠️  Dev server not detected. Starting it now...${NC}"
    npm run dev &
    DEV_PID=$!
    echo "Waiting for server to start..."
    sleep 10
    
    if curl -s http://localhost:3001 > /dev/null; then
        echo -e "${GREEN}✅ Dev server started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start dev server${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🧪 Running Reliable E2E Tests...${NC}"
echo ""

# Test 1: Authentication Flow
echo -e "${YELLOW}1. Testing Authentication Flow...${NC}"
npm run test:auth -- --reporter=list
AUTH_RESULT=$?

echo ""

# Test 2: Project Ideas Generation (FR24)
echo -e "${YELLOW}2. Testing Project Ideas Generation (FR24)...${NC}"
npm run test:project-ideas -- --reporter=list
PROJECT_IDEAS_RESULT=$?

echo ""

# Generate HTML Report
echo -e "${BLUE}📊 Generating Test Report...${NC}"
npm run test:e2e -- --reporter=html

echo ""
echo "🎯 Test Results Summary:"
echo "========================"

if [ $AUTH_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Authentication Flow: PASSED${NC}"
else
    echo -e "${RED}❌ Authentication Flow: FAILED${NC}"
fi

if [ $PROJECT_IDEAS_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Project Ideas Generation (FR24): PASSED${NC}"
else
    echo -e "${RED}❌ Project Ideas Generation (FR24): FAILED${NC}"
fi

echo ""
echo -e "${BLUE}📁 Test artifacts available at:${NC}"
echo "   - HTML Report: test-results/html/index.html"
echo "   - Screenshots: test-results/"
echo "   - Videos: test-results/"

echo ""
if [ $AUTH_RESULT -eq 0 ] && [ $PROJECT_IDEAS_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your app is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Check the reports for details.${NC}"
    exit 1
fi 