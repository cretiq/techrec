# Recent Changes Git Commit Command

This command analyzes and commits only the changes that have been made in the current working session, rather than all changes in the working directory.

## Purpose
- Commit only the changes made during the current session/conversation
- Avoid committing unrelated or pre-existing changes
- Generate clear, descriptive commit messages for the specific work completed
- Maintain focused, logical commits that represent discrete units of work

## Usage
Simply reference this command: `@.claude/commands/commit-recent`

*Last tested: January 31, 2025*

## Behavior
1. **Identify Recent Changes**: Focus only on files that were modified during the current session
2. **Selective Staging**: Stage only the specific changes that were made recently
3. **Context-Aware Commits**: Create commits that reflect the work actually performed
4. **Message Relevance**: Generate commit messages that accurately describe the recent work
5. **Clean Commits**: Ensure commits are focused and don't include unrelated modifications

## Commit Message Format
```
<type>(<scope>): <description>

[optional body explaining the recent changes and their purpose]

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Types Used
- `feat:` - New features or functionality added recently
- `fix:` - Bug fixes or error corrections made in this session
- `refactor:` - Code restructuring performed recently
- `perf:` - Performance improvements made
- `test:` - Tests added or modified in this session
- `docs:` - Documentation changes made recently
- `style:` - Code formatting or UI changes made
- `chore:` - Maintenance tasks completed recently

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
1. **Review Session Context**: Identify which files were modified during the current conversation
2. **Selective Analysis**: Run `git status` and `git diff` focusing on recent changes
3. **Targeted Staging**: Stage only the files that were actually worked on
4. **Focused Commits**: Create commits that represent the specific work completed
5. **Verification**: Ensure only intended changes are committed

## Key Differences from `commit.md`
- **Selective Scope**: Only commits changes made in the current session
- **Session Awareness**: Takes into account the work actually performed
- **Avoids Conflicts**: Prevents committing unrelated or pre-existing changes
- **Focused History**: Creates cleaner git history with intentional commits
- **Reduced Risk**: Lower chance of accidentally committing unwanted changes

## Best Practices
- Use this command when you want to commit only your recent work
- Ideal for incremental commits during development sessions
- Helps maintain clean, focused commit history
- Reduces the risk of committing unrelated changes
- Perfect for collaborative environments where multiple changes may exist