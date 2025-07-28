#!/bin/bash

# Background Test Runner for AI Access
# Usage: ./scripts/run-test-background.sh [test-command]

set -e

TEST_CMD="${1:-npm run test:auth -- --project=chromium}"
RESULTS_DIR="test-results"
PID_FILE="$RESULTS_DIR/test.pid"
LOG_FILE="$RESULTS_DIR/test.log"
STATUS_FILE="$RESULTS_DIR/test.status"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting background test execution...${NC}"
echo "Command: $TEST_CMD"

# Clean up previous run
rm -f "$PID_FILE" "$LOG_FILE" "$STATUS_FILE"
mkdir -p "$RESULTS_DIR"

# Mark as started
echo "RUNNING" > "$STATUS_FILE"
echo "$(date): Test started" > "$LOG_FILE"

# Run test in background and capture PID
($TEST_CMD > "$LOG_FILE" 2>&1; echo $? > "$STATUS_FILE") &
TEST_PID=$!
echo $TEST_PID > "$PID_FILE"

echo -e "${GREEN}✅ Test running in background (PID: $TEST_PID)${NC}"
echo -e "${BLUE}📊 Monitor with: tail -f $LOG_FILE${NC}"
echo -e "${BLUE}📁 Results will be in: $RESULTS_DIR/${NC}"

# Optional: Wait and report completion (for immediate feedback)
if [[ "${2:-}" == "--wait" ]]; then
    echo -e "${BLUE}⏳ Waiting for completion...${NC}"
    
    while kill -0 $TEST_PID 2>/dev/null; do
        sleep 2
        echo -n "."
    done
    
    echo ""
    EXIT_CODE=$(cat "$STATUS_FILE" 2>/dev/null || echo "UNKNOWN")
    
    if [[ "$EXIT_CODE" == "0" ]]; then
        echo -e "${GREEN}🎉 Tests completed successfully!${NC}"
    else
        echo -e "${RED}❌ Tests failed (exit code: $EXIT_CODE)${NC}"
    fi
    
    echo -e "${BLUE}📄 Results available in:${NC}"
    echo "  - JSON: $RESULTS_DIR/results.json"
    echo "  - XML:  $RESULTS_DIR/results.xml" 
    echo "  - HTML: playwright-report/"
fi 