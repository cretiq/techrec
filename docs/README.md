# TechRec Documentation

A comprehensive guide to the TechRec platform architecture, implementation patterns, and feature development.

## Architecture & Critical Decisions

Strategic architectural decisions and core system design patterns:

- **[Gamification Strategy](architecture/gamification-strategy.md)** - Complete system design with dual-progression architecture (XP levels + subscription tiers)
- **[Redis vs Redux Framework](architecture/redis-vs-redux-framework.md)** - State management decision framework with implementation patterns
- **[Data TestID Strategy](architecture/data-testid-strategy.md)** - Testing conventions and component identification standards

## Implementation Guides

Comprehensive guides for implementing core platform features:

- **[Role Persistence Implementation](implementation/role-persistence-implementation.md)** - Redux Persist integration for user workflow continuity
- **[Design System](implementation/design-system.md)** - UI guidelines, color schemes, and component patterns
- **[Troubleshooting](implementation/troubleshooting.md)** - Common issues and solutions for development workflows
- **[Roles Persistence Verification](implementation/roles-persistence-verification.md)** - Testing and validation procedures

## Feature Documentation

Detailed documentation for specific platform features:

- **[CV Data Flow](features/cv-data-flow.md)** - Data processing pipeline with Mermaid diagrams
- **[Button Style Guide](features/button-style-guide.md)** - UI component standardization and styling patterns
- **[RapidAPI Implementation Summary](features/rapidapi-implementation-summary.md)** - External API integration patterns
- **[RapidAPI Documentation](features/rapidapi-documentation.md)** - API endpoint documentation and usage
- **[API Call Prevention Verification](features/api-call-prevention-verification.md)** - Performance optimization validation

## Deployment & Operations

Production deployment and operational procedures:

- **[Production Activation Guide](deployment/production-activation-guide.md)** - Complete deployment checklist and environment setup

---

## Documentation Standards

### File Organization
- **Architecture**: Core system design decisions and strategic patterns
- **Implementation**: Step-by-step guides for feature development
- **Features**: Specific functionality documentation and data flows
- **Deployment**: Production and operational procedures

### Link Conventions
- Use relative paths for internal documentation links
- Include descriptive link text that explains the content
- Cross-reference related documentation where appropriate

### Maintenance Notes
- All cross-references updated to use relative paths
- Files organized by technical function and development workflow
- Git history preserved for all moved files
- Content validated for accuracy and completeness

*Last updated: July 2025 - Complete documentation architecture reorganization*