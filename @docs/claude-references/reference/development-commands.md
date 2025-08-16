# Development Commands

Complete reference for all development, database, testing, and analysis commands.

## Development
```bash
npm run dev                    # Development server (port 3000)
npm run build                  # Production build
npm run lint                   # ESLint
npm run test                   # Jest tests
```

## Database
```bash
npx prisma migrate dev         # Run migrations
npx prisma generate           # Generate client
npx prisma studio            # GUI
```

## Testing

### Unit Tests (New Implementation)
```bash
npm test -- __tests__/unit/                    # All unit tests (0.4s)
npm test -- __tests__/unit/pointsManager.test.ts    # PointsManager tests
npm test -- __tests__/unit/debugMode.test.ts        # Debug mode tests  
npm test -- __tests__/unit/searchValidation.test.ts # Search validation
npm test -- __tests__/unit/usageTracking.test.ts    # Usage tracking
npm test -- __tests__/unit/ --verbose          # Verbose output
```

### E2E Tests (Legacy)
```bash
npm run test:e2e              # Playwright E2E tests
npx playwright test --headed  # Run tests with visible browser
```

## AI Debug Analysis

### CV Upload Debug
```bash
# Analyze latest direct upload session
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-direct-upload.ts

# Analyze both upload methods (auto-detects)
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-cv-upload-parsing.ts
```

### Cover Letter Debug
```bash
# Analyze cover letter debug sessions
DEBUG_COVER_LETTER=true NODE_ENV=development npx tsx scripts/analyze-cover-letter-generation.ts
```

### Quick Debug Commands
```bash
# Cover Letter Debug
DEBUG_COVER_LETTER=true NODE_ENV=development npx tsx scripts/analyze-cover-letter-generation.ts

# CV Upload Debug  
DEBUG_CV_UPLOAD=true NODE_ENV=development npx tsx scripts/analyze-direct-upload.ts
```

## Server Management
```bash
# Clean environment
pkill -f "npm run dev"

# Start server with logging
nohup npm run dev > server.log 2>&1 &

# Validate startup
sleep 3 && head -10 server.log
```

## Log Monitoring
```bash
# Monitor logs during development
tail -f server.log

# Search for specific errors
grep -i "error\|failed\|exception" server.log

# Monitor API endpoints
grep -i "upload\|gemini\|analysis" server.log

# Authentication debugging
grep -i "session\|auth\|unauthorized" server.log
```

## Environment Setup

### Debug Environment Variables
```bash
# Add to .env.local for permanent debugging:
DEBUG_CV_UPLOAD=true
DEBUG_COVER_LETTER=true
NODE_ENV=development
ENABLE_DIRECT_GEMINI_UPLOAD=true

# Or set per-command for one-off analysis:
DEBUG_CV_UPLOAD=true NODE_ENV=development [command]
DEBUG_COVER_LETTER=true NODE_ENV=development [command]
```

## Related Documentation

- **Environment Variables**: See complete environment variable reference
- **Debug Workflows**: See workflow docs for detailed debug procedures
- **Testing Strategy**: See development docs for testing guidelines
- **Server Management**: See operations docs for server monitoring