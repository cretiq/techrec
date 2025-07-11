# Cursor Rules Index

This directory contains all cursor rules organized by category. Each rule file includes frontmatter with description, file globs, and dependencies.

## Directory Structure

```
.cursor/rules/
├── core/               # Fundamental coding standards
├── frontend/           # Frontend-specific guidelines
├── backend/            # Backend and API guidelines
├── architecture/       # Project structure and organization
├── workflows/          # Development workflows and processes
└── meta/               # Rules about rules and AI behavior
```

## Core Rules

### [coding-standards.mdc](core/coding-standards.mdc)
**Description**: Core coding standards and conventions shared across the entire codebase  
**Applies to**: All TypeScript/JavaScript files  
**Topics**: Naming conventions, formatting, imports, comments, best practices, version control

### [typescript.mdc](core/typescript.mdc)
**Description**: TypeScript best practices, type safety guidelines, and advanced patterns  
**Applies to**: All TypeScript files  
**Topics**: Type definitions, generics, type guards, utility types, React types

### [error-handling.mdc](core/error-handling.mdc)
**Description**: Comprehensive error handling patterns for client and server  
**Applies to**: All TypeScript files, API routes  
**Topics**: Error boundaries, async errors, API errors, retry logic, monitoring

## Frontend Rules

### [react-patterns.mdc](frontend/react-patterns.mdc)
**Description**: React and Next.js best practices and patterns  
**Applies to**: React components  
**Topics**: Component design, hooks, performance, accessibility

### [ui-standards.mdc](frontend/ui-standards.mdc)
**Description**: UI/UX standards including DaisyUI components, layout, typography  
**Applies to**: Components, styles  
**Topics**: Component architecture, spacing, colors, responsive design, animations

### [state-management.mdc](frontend/state-management.mdc)
**Description**: State management using Redux Toolkit, Context API, and local state  
**Applies to**: State management files, components  
**Topics**: Redux setup, slices, persistence, performance, testing

## Backend Rules

### [api-conventions.mdc](backend/api-conventions.mdc)
**Description**: API Route Handler conventions including validation and error handling  
**Applies to**: API routes (`app/api/**`)  
**Topics**: Request/response handling, status codes, validation, authentication

## Architecture Rules

### [nextjs-structure.mdc](architecture/nextjs-structure.mdc)
**Description**: Next.js App Router project structure and file organization  
**Applies to**: Project structure  
**Topics**: Directory layout, file naming, import aliases, module boundaries

## Workflow Rules

### [taskmaster.mdc](workflows/taskmaster.mdc)
**Description**: Comprehensive Taskmaster tool and command reference  
**Applies to**: Task management files  
**Topics**: MCP tools, CLI commands, task structure, environment variables

### [dev-workflow.mdc](workflows/dev-workflow.mdc)
**Description**: Standard development workflow using Taskmaster  
**Applies to**: Development process  
**Topics**: Task management, implementation flow, complexity analysis

### [taskmaster-core.mdc](workflows/taskmaster-core.mdc)
**Description**: Core Taskmaster principles and concepts  
**Applies to**: Task management  
**Topics**: Structure, dependencies, complexity, workflow

### [cv-analysis-flow.mdc](workflows/cv-analysis-flow.mdc)
**Description**: CV upload, storage, analysis, and improvement workflow  
**Applies to**: CV management features  
**Topics**: Upload flow, background analysis, Redux integration

## Meta Rules

### [cursor-rules.mdc](meta/cursor-rules.mdc)
**Description**: Guidelines for creating and maintaining cursor rules  
**Applies to**: Rule files  
**Topics**: Rule structure, formatting, references, maintenance

### [ai-behavior.mdc](meta/ai-behavior.mdc)
**Description**: Request analysis and deep understanding approach  
**Applies to**: AI assistant behavior  
**Topics**: Request deconstruction, clarification, confirmation

### [ai-specification.mdc](meta/ai-specification.mdc)
**Description**: AI integration standards and prompt engineering  
**Applies to**: AI features  
**Topics**: Prompt engineering, response handling, rate limiting

### [documentation-driven-development.mdc](meta/documentation-driven-development.mdc)
**Description**: Documentation-first development approach  
**Applies to**: Development process  
**Topics**: RTFM principle, documentation workflow, rule management

## How to Use These Rules

1. **Automatic Application**: Rules with `alwaysApply: true` are always considered
2. **Glob-Based**: Rules apply to files matching their glob patterns
3. **Dependencies**: Some rules depend on others (check `dependencies` in frontmatter)
4. **Context**: AI will fetch relevant rules based on the files you're working with

## Best Practices

1. **Keep Rules Focused**: Each rule should cover a specific topic
2. **Use Cross-References**: Link to related rules using `[Rule Name](mdc:.cursor/rules/category/rule.mdc)`
3. **Include Examples**: Show both good (✅) and bad (❌) examples
4. **Update Regularly**: Keep rules current with codebase evolution
5. **Version Control**: Track all rule changes in git

## Quick Reference

- **Starting a new feature?** Check [dev-workflow.mdc](workflows/dev-workflow.mdc)
- **Writing TypeScript?** See [typescript.mdc](core/typescript.mdc)
- **Building UI?** Review [ui-standards.mdc](frontend/ui-standards.mdc)
- **Creating API?** Follow [api-conventions.mdc](backend/api-conventions.mdc)
- **Managing state?** Read [state-management.mdc](frontend/state-management.mdc)
- **Handling errors?** Use [error-handling.mdc](core/error-handling.mdc) 