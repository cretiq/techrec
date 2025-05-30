# API v1 Endpoints - DEPRECATED

⚠️ **DEPRECATED**: These endpoints are no longer used by the application.

## Status
- No external references found in codebase
- Replaced by newer endpoints in `/api/cv-analysis/` and `/api/cv/`
- Consider removing after confirming no external integrations depend on these

## Endpoints
- `POST /api/v1/cv/analyze` - CV analysis with structured response
  - Has authentication placeholders
  - Uses controller pattern
  - Appears to be an early version of current CV analysis flow

## Migration
Current CV analysis is handled by:
- `/api/cv-analysis/` - Main analysis endpoints
- `/api/cv/` - CV upload and management
- `/api/cv-improvement*` - CV improvement suggestions
- `/api/optimize-cv*` - CV optimization

## Recommendation
Consider removing these files if no external API consumers exist.