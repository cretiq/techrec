#!/bin/bash

# AI Autonomous Test Runner
# Handles complete testing workflow without manual intervention

set -e

# Configuration
RESULTS_DIR="test-results"
LOG_FILE="$RESULTS_DIR/ai-test.log"
STATUS_FILE="$RESULTS_DIR/ai-test.status"
COMPLETION_FILE="$RESULTS_DIR/ai-test.complete"

# Functions
run_test_autonomous() {
    local test_cmd="$1"
    local test_name="${2:-test}"
    
    echo "STARTING" > "$STATUS_FILE"
    echo "$(date): AI Test Runner started: $test_cmd" > "$LOG_FILE"
    
    # Run test and capture all output
    echo "RUNNING" > "$STATUS_FILE"
    if $test_cmd >> "$LOG_FILE" 2>&1; then
        echo "SUCCESS" > "$STATUS_FILE"
        echo "$(date): Test completed successfully" >> "$LOG_FILE"
    else
        echo "FAILED" > "$STATUS_FILE"
        echo "$(date): Test failed" >> "$LOG_FILE"
    fi
    
    # Signal completion
    echo "$(date)" > "$COMPLETION_FILE"
    echo "COMPLETE" > "$STATUS_FILE"
}

# Check if already running
if [[ -f "$STATUS_FILE" ]] && [[ "$(cat "$STATUS_FILE")" == "RUNNING" ]]; then
    echo "Test already running. Current status: $(cat "$STATUS_FILE" 2>/dev/null || echo 'UNKNOWN')"
    exit 1
fi

# Clean up previous run
rm -f "$STATUS_FILE" "$COMPLETION_FILE"
mkdir -p "$RESULTS_DIR"

# Parse command
TEST_CMD="$1"
TEST_NAME="${2:-test}"

if [[ -z "$TEST_CMD" ]]; then
    echo "Usage: $0 <test-command> [test-name]"
    echo "Examples:"
    echo "  $0 'npm run test:auth -- --project=chromium' auth"
    echo "  $0 'npm run test:project-ideas' project-ideas"
    exit 1
fi

# Run in background
run_test_autonomous "$TEST_CMD" "$TEST_NAME" &

echo "✅ AI test runner started in background"
echo "📊 Monitor: $LOG_FILE"
echo "📁 Results: $RESULTS_DIR/"
echo "🤖 AI can now access results autonomously" 