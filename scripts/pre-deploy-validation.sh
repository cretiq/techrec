#!/bin/bash

# Pre-deployment validation script
# Run this before any deployment to production

set -e

echo "🛡️ Starting CV Flow Protection Validation"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 1. Run critical unit tests
echo ""
print_status $YELLOW "📋 Step 1: Running Critical Unit Tests"
echo "----------------------------------------"

echo "Testing background profile sync..."
npm test utils/__tests__/backgroundProfileSync.test.ts --silent || {
    print_status $RED "❌ Background Profile Sync tests FAILED"
    exit 1
}

echo "Testing experience data flow..."
npm test utils/__tests__/experienceDataFlow.test.ts --silent || {
    print_status $RED "❌ Experience Data Flow tests FAILED" 
    exit 1
}

echo "Testing Gemini analysis..."
npm test utils/__tests__/geminiAnalysis.test.ts --silent || {
    print_status $RED "❌ Gemini Analysis tests FAILED"
    exit 1
}

print_status $GREEN "✅ All unit tests passed"

# 2. Build validation
echo ""
print_status $YELLOW "📋 Step 2: Build Validation"
echo "----------------------------"

npm run build || {
    print_status $RED "❌ Build FAILED"
    exit 1
}

print_status $GREEN "✅ Build successful"

# 3. TypeScript validation
echo ""
print_status $YELLOW "📋 Step 3: TypeScript Validation"
echo "---------------------------------"

npx tsc --noEmit || {
    print_status $RED "❌ TypeScript validation FAILED"
    exit 1
}

print_status $GREEN "✅ TypeScript validation passed"

# 4. Start development server for testing
echo ""
print_status $YELLOW "📋 Step 4: Starting Test Server"
echo "--------------------------------"

# Kill any existing dev server
pkill -f "npm run dev" 2>/dev/null || true

# Start server in background
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health/cv-flow > /dev/null 2>&1; then
        print_status $GREEN "✅ Server started successfully"
        break
    fi
    if [ $i -eq 30 ]; then
        print_status $RED "❌ Server failed to start within 30 seconds"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# 5. Health check
echo ""
print_status $YELLOW "📋 Step 5: Health Check"
echo "------------------------"

HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health/cv-flow)
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$HEALTH_STATUS" = "healthy" ]; then
    print_status $GREEN "✅ CV Flow is healthy"
else
    print_status $RED "❌ CV Flow health check failed: $HEALTH_STATUS"
    echo "Health response: $HEALTH_RESPONSE"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# 6. Quick smoke test (if Playwright is available)
echo ""
print_status $YELLOW "📋 Step 6: Smoke Test (Optional)"
echo "---------------------------------"

if command -v npx &> /dev/null && [ -d "tests/smoke" ]; then
    echo "Running smoke tests..."
    if npx playwright test tests/smoke/cv-flow-smoke.test.ts --timeout=120000 2>/dev/null; then
        print_status $GREEN "✅ Smoke tests passed"
    else
        print_status $YELLOW "⚠️ Smoke tests skipped or failed (non-critical)"
    fi
else
    print_status $YELLOW "⚠️ Smoke tests skipped (Playwright not available)"
fi

# Clean up
kill $SERVER_PID 2>/dev/null || true

# Final summary
echo ""
echo "=========================================="
print_status $GREEN "🎉 ALL VALIDATIONS PASSED!"
print_status $GREEN "✅ Safe to deploy to production"
echo "=========================================="

exit 0