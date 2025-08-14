# Essential File Locations

Complete reference of key directories and files in the TechRec codebase.

## 📁 Key Directories

```
├── app/api/                   # API routes
├── components/                # UI components
│   ├── ui/                   # Legacy shadcn components
│   ├── ui-daisy/            # DaisyUI components
│   └── gamification/        # Gamification UI
├── lib/features/             # Redux slices
├── lib/gamification/         # Gamification logic
├── utils/                    # Utility services
├── scripts/                  # Debug analysis and utility scripts
├── logs/                     # Debug output (development only)
│   ├── direct-gemini-upload/ # Direct upload debug sessions
│   ├── cover-letter-generation/ # Cover letter debug sessions (unified files)
│   └── cv-upload-parse-*     # Traditional upload debug sessions
├── prisma/                   # Database schema
├── types/                    # TypeScript definitions
└── requests/                 # Feature request management system
    ├── index.md              # Main navigation hub with statistics
    ├── ideas-parking-lot.md  # Brainstorming and raw concepts  
    ├── active/               # Active feature requests (14 files)
    ├── completed/            # Completed features archive (20+ files)
    └── templates/            # Feature request template system
```

## 📁 Key CV Upload Files

```
├── app/api/cv/upload/route.ts           # Main upload API (Direct Upload primary)
├── utils/directGeminiUpload.ts          # Direct Gemini upload service
├── utils/directUploadDebugLogger.ts     # Direct upload debug logging
├── scripts/analyze-direct-upload.ts     # Direct upload analysis script
├── scripts/analyze-cv-upload-parsing.ts # Universal upload analyzer
└── utils/backgroundProfileSync.ts       # Profile data synchronization
```

## 📁 Key Cover Letter Debug Files

```
├── app/api/generate-cover-letter/route.ts        # Cover letter generation API (with unified debug)
├── utils/debugLogger.ts                          # CoverLetterDebugLogger (unified file system)
├── scripts/analyze-cover-letter-generation.ts    # Cover letter debug analysis script
└── logs/cover-letter-generation/                 # Unified debug files directory
```

## Important File Descriptions

### API Routes (`app/api/`)
- **cv/**: CV file upload and metadata management
- **developer/me/**: Profile CRUD operations (single source of truth)
- **gamification/**: XP, points, achievements, challenges
- **subscription/**: Stripe integration and webhooks
- **generate-*/**: AI content generation endpoints
- **rapidapi/**: Job search with AI-enriched LinkedIn data

### Components (`components/`)
- **ui/**: Legacy shadcn/ui components (being phased out)
- **ui-daisy/**: Current DaisyUI component library (40+ components)
- **gamification/**: Specialized gamification UI components

### Configuration Files
- **tailwind.config.ts**: Critical Tailwind CSS configuration with safelist
- **prisma/schema.prisma**: Database schema definition
- **lib/modelConfig.ts**: Centralized Gemini model configuration
- **lib/redis.ts**: Redis connection management

### Debug & Analysis (`scripts/`)
- Analysis scripts for debugging CV upload and cover letter generation
- Utility scripts for database maintenance and testing

### Documentation
- **CLAUDE.md**: Primary project guidelines
- **@docs/claude-references/**: Detailed technical documentation
- **GAMIFICATION_STRATEGY.md**: Comprehensive gamification documentation
- **requests/**: Feature request tracking system