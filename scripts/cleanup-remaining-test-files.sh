#!/bin/bash
# Cleanup remaining test and demo files after careful analysis

echo "Removing test and demo files..."

# Test files that are NOT imported anywhere
rm -f ./app/test.tsx
rm -f ./test.txt
rm -f ./test.pdf

# Demo files
rm -f ./app/demo-cover-letter/page.tsx
rm -f ./app/demo-cover-letter/layout.tsx
rm -f ./app/daisyui-test/page.tsx

# Form components test page (appears unused)
rm -f ./app/form-components/page.tsx
rm -f ./app/form-components/loading.tsx

echo "✅ Removed test and demo files"

# Note: NOT removing these as they're actively used:
# - ./app/api/redis-test/route.ts (used by cv-management page)
# - ./app/api/linkedin/test-endpoint/route.ts (used by linkedin jobs page)
# - RapidAPI example JSONs (imported by the API route)

echo ""
echo "Kept files that are actively used:"
echo "- /api/redis-test (used for Redis testing in CV management)"
echo "- /api/linkedin/test-endpoint (used for LinkedIn API testing)"
echo "- RapidAPI example JSONs (imported by search route)"