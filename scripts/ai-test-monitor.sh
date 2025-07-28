#!/bin/bash

# AI Test Monitor - Polls for test completion and provides status
# Usage: ./scripts/ai-test-monitor.sh [timeout_seconds]

RESULTS_DIR="test-results"
STATUS_FILE="$RESULTS_DIR/ai-test.status"
COMPLETION_FILE="$RESULTS_DIR/ai-test.complete"
TIMEOUT="${1:-30}"  # Default 30 second timeout

check_status() {
    if [[ ! -f "$STATUS_FILE" ]]; then
        echo "NO_TEST"
        return 1
    fi
    
    local status=$(cat "$STATUS_FILE" 2>/dev/null || echo "UNKNOWN")
    echo "$status"
    
    case "$status" in
        "COMPLETE"|"SUCCESS"|"FAILED")
            return 0  # Test finished
            ;;
        *)
            return 1  # Still running or unknown
            ;;
    esac
}

# Check current status
CURRENT_STATUS=$(check_status)
echo "Current test status: $CURRENT_STATUS"

if [[ "$CURRENT_STATUS" == "NO_TEST" ]]; then
    echo "❌ No test is currently running"
    exit 1
fi

if check_status > /dev/null; then
    echo "✅ Test already complete"
    echo "📄 Results ready for analysis"
    exit 0
fi

# Poll for completion
echo "⏳ Waiting for test completion (timeout: ${TIMEOUT}s)..."
start_time=$(date +%s)

while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    if [[ $elapsed -gt $TIMEOUT ]]; then
        echo "⏰ Timeout reached (${TIMEOUT}s)"
        echo "📊 Current status: $(cat "$STATUS_FILE" 2>/dev/null || echo 'UNKNOWN')"
        exit 2
    fi
    
    if check_status > /dev/null; then
        final_status=$(check_status)
        echo ""
        echo "🎉 Test completed! Status: $final_status"
        echo "📄 Results ready for AI analysis"
        exit 0
    fi
    
    # Show progress
    echo -n "."
    sleep 2
done 