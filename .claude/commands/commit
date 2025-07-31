# Intelligent Git Commit Command

This command analyzes the current working directory changes and creates logical, well-structured commits following best practices.

## Purpose
- Automatically stage and commit all changes in logical chunks
- Generate clear, descriptive commit messages following conventional commit format
- Divide changes into appropriate commit sizes for better version control
- Follow the project's established commit patterns and conventions

## Usage
Simply reference this command: `@.claude/commands/commit`

## Behavior
1. **Analyze Changes**: Review all unstaged and staged changes
2. **Logical Grouping**: Group related changes together (features, fixes, refactoring, etc.)
3. **Commit Strategy**: Create multiple commits if changes span different concerns
4. **Message Format**: Use conventional commit format with proper scopes
5. **Verification**: Ensure commits are clean and properly documented

## Commit Message Format
```
<type>(<scope>): <description>

[optional body explaining why, not what]

[optional footer with breaking changes/closes issues]
🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Types Used
- `feat:` - New features or functionality
- `fix:` - Bug fixes or error corrections  
- `refactor:` - Code restructuring without changing functionality
- `perf:` - Performance improvements
- `test:` - Adding or modifying tests
- `docs:` - Documentation changes
- `style:` - Code formatting, no logic changes
- `chore:` - Maintenance tasks, build changes

## Scopes (Project-Specific)
- `gamification` - Gamification system features
- `subscription` - Stripe integration and subscription management
- `cv-analysis` - CV parsing, analysis, and improvement features
- `auth` - Authentication and authorization
- `ui` - User interface components and styling
- `api` - Backend API endpoints and logic
- `db` - Database schema, migrations, or queries
- `architecture` - System architecture changes

## Execution
When this command is referenced, Claude will:
1. Run `git status` to see current changes
2. Run `git diff` to understand change content
3. Review recent commit history for context
4. Create logical commit groups
5. Stage and commit each group with appropriate messages
6. Verify all changes are committed successfully