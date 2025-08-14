# CLAUDE.md Reference Documentation

This directory contains detailed technical documentation extracted from CLAUDE.md to maintain optimal context size while preserving all critical information.

## 📚 Enhanced Documentation Structure

### 🏗️ Architecture
System architecture and database design:

- **[Database Schema](architecture/database-schema.md)** - Complete database structure, relationships, and data flow

### 🔧 Development  
Development guides and best practices:

- **[Styling Utilities Guide](development/styling-utilities-guide.md)** - Complete guide to cn(), twMerge(), and conditional styling
- **[Testing Strategy](development/testing-strategy.md)** - Critical testing rules, patterns, and user types
- **[Component Checklist](development/component-checklist.md)** - Pre-shipping checklist for UI components
- **[AI Integration Patterns](development/ai-integration-patterns.md)** - Centralized model management and code examples

### 🔧 Operations
Server management and monitoring:

- **[Server Management](operations/server-management.md)** - Process management, debugging, and health checks

### 🔗 Integrations
External service integrations:

- **[RapidAPI Integration](integrations/rapidapi-integration.md)** - Job search API integration with AI enhancements

### 🔧 Workflows
Detailed technical workflows for debugging and analysis:

- **[Cover Letter Debug Workflow](workflows/cover-letter-debug.md)** - Three-file debug system with enhanced analysis
- **[CV Upload Debug Workflow](workflows/cv-upload-debug.md)** - Direct Gemini upload pipeline analysis

### 📋 Reference
Technical reference material and configuration:

- **[Development Commands](reference/development-commands.md)** - Complete command reference for all development tasks
- **[Environment Variables](reference/environment-variables.md)** - Complete list of required environment variables
- **[File Locations](reference/file-locations.md)** - Detailed file structure and key file locations

### 📜 Historical
- **[Changelog](changelog.md)** - Complete update history and version tracking

## 🎯 When to Use These References

**Start with CLAUDE.md** for:
- Critical rules and non-negotiables
- Core architecture patterns  
- Component development guidelines
- API development standards
- Quick reference for common tasks

**Use these reference docs** for:
- **Architecture**: Database schema details, system design
- **Development**: Detailed coding guides, patterns, and checklists
- **Operations**: Server management and troubleshooting procedures  
- **Integrations**: External API setup and configuration
- **Workflows**: Step-by-step debug procedures
- **Reference**: Command lists, environment setup, file locations
- **Historical**: Change tracking and version history

## 🚀 Quick Access by Task

### 🔧 **Development Tasks**
- **Styling components** → [Styling Utilities Guide](development/styling-utilities-guide.md)
- **Writing tests** → [Testing Strategy](development/testing-strategy.md)  
- **Shipping components** → [Component Checklist](development/component-checklist.md)
- **AI integration** → [AI Integration Patterns](development/ai-integration-patterns.md)

### 🐛 **Debugging Tasks**  
- **Cover letter issues** → [Cover Letter Debug](workflows/cover-letter-debug.md)
- **CV upload issues** → [CV Upload Debug](workflows/cv-upload-debug.md)
- **Server problems** → [Server Management](operations/server-management.md)

### 📋 **Reference Tasks**
- **Need a command** → [Development Commands](reference/development-commands.md)
- **Setting up environment** → [Environment Variables](reference/environment-variables.md)
- **Finding a file** → [File Locations](reference/file-locations.md)

## 📖 Documentation Maintenance

When updating these references:
1. **Update the specific atomic documentation file** (maintain single source of truth)
2. **Ensure CLAUDE.md summary remains accurate** (keep main file current)
3. **Update this index if adding new files** (maintain discoverability)
4. **Keep references self-contained and complete** (avoid cross-dependencies)
5. **Add cross-references to related docs** (improve navigation)

**Remember**: CLAUDE.md is the primary entry point. These references provide depth without cluttering the main guide.