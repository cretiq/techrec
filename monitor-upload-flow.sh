#!/bin/bash

echo "🔍 CV Upload Flow Monitor"
echo "========================="
echo ""
echo "Monitoring server logs for upload method selection and flow execution..."
echo "Upload a CV to see which method is being used!"
echo ""
echo "Legend:"
echo "🎯 [CV-UPLOAD]     = Method selection"
echo "🚀 [DIRECT-GEMINI] = New direct upload flow (gemini-2.0-flash)"
echo "📄 [TRADITIONAL]   = Old traditional flow (pdf2json + gemini-1.5-pro)"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Monitor the server log and filter for upload-related messages
tail -f server.log | grep -E "(CV-UPLOAD|DIRECT-GEMINI|TRADITIONAL)" --line-buffered | while read line; do
    echo "$(date '+%H:%M:%S') | $line"
done