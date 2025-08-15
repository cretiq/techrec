# Environment Variables Required

Complete reference of all environment variables required for the TechRec platform.

## Database & Caching
```bash
MONGODB_URI=              # MongoDB connection
REDIS_URL=               # Redis connection
REDIS_USE_TLS=true       # Force TLS
```

## Authentication
```bash
NEXTAUTH_URL=            # App URL
NEXTAUTH_SECRET=         # JWT secret
GOOGLE_CLIENT_ID=        # OAuth provider
```

## AI Providers
```bash
OPENAI_API_KEY=         # GPT models (legacy support)
GOOGLE_AI_API_KEY=      # Gemini models
```

## Gemini Model Configuration (Centralized System)
```bash
GEMINI_MODEL=                     # Global fallback model (default: gemini-2.5-flash)
GEMINI_CV_ANALYSIS_MODEL=         # Model for CV parsing and profile extraction
GEMINI_CV_IMPROVEMENT_MODEL=      # Model for CV improvement suggestions
GEMINI_CV_OPTIMIZATION_MODEL=     # Model for CV optimization against job descriptions
GEMINI_COVER_LETTER_MODEL=        # Model for cover letter generation
GEMINI_OUTREACH_MODEL=            # Model for outreach message generation
GEMINI_PROJECT_DESC_MODEL=        # Model for project description generation
GEMINI_PROJECT_IDEAS_MODEL=       # Model for project idea generation
GEMINI_README_ANALYSIS_MODEL=     # Model for README file analysis
GEMINI_DIRECT_UPLOAD_MODEL=       # Model for direct PDF upload processing
```

## Payments
```bash
STRIPE_SECRET_KEY=      # Stripe integration
STRIPE_WEBHOOK_SECRET=  # Webhook security
```

## Storage
```bash
AWS_S3_BUCKET_NAME=     # File storage
```

## Debug & Development
```bash
DEBUG_CV_UPLOAD=true        # Enable CV upload debug logging
DEBUG_COVER_LETTER=true     # Enable cover letter generation debug logging
```

## MVP Beta Testing
```bash
NEXT_PUBLIC_ENABLE_MVP_MODE=true  # Enable beta testing points system (replaces ENABLE_MVP_MODE)
MVP_INITIAL_POINTS=300            # Initial points allocation for beta testers
MVP_POINTS_PER_RESULT=1           # Points charged per job search result
MVP_WARNING_THRESHOLD=50          # Show warning when points below this
MVP_CRITICAL_THRESHOLD=10         # Show critical warning below this
```

## Configuration Notes

### Model Configuration
- All Gemini models are centralized through `lib/modelConfig.ts`
- Use environment variables to override default models per use case
- Fallback hierarchy: Specific model → GEMINI_MODEL → hardcoded default

### Debug Settings
- Debug flags should only be enabled in development
- Debug files are written to `/logs/` directory
- See workflow documentation for detailed debug procedures

### Security
- Never commit `.env.local` or expose secrets
- Use environment-specific configurations for staging/production
- Rotate secrets regularly