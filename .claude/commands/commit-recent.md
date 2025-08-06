# Git Commit Recent Changes - AI Instructions

You are tasked with analyzing and committing ONLY the changes made during the current working session. Follow these instructions precisely.

## Your Mission
When this command is invoked, you must:
1. Identify files modified in the current conversation/session
2. Stage only those specific changes
3. Create a focused commit with an accurate message
4. Verify the commit contains only intended changes

## Execution Steps

### Step 1: Analyze Current Session Context
- Review the conversation history to identify which files were modified
- Make a mental list of all changes made during this session
- Ignore any pre-existing uncommitted changes from before this session

### Step 2: Check Git Status
Run these commands in parallel:
```bash
git status
git diff --stat
```

### Step 3: Review Changes
For each file that was modified in this session:
```bash
git diff <filename>
```
Confirm the changes match what was done in the current session.

### Step 4: Selective Staging
Stage ONLY the files that were modified during this session:
```bash
git add <file1> <file2> ...
```
DO NOT use `git add .` or `git add -A`

### Step 5: Verify Staged Changes
```bash
git diff --cached
```
Ensure only the intended recent changes are staged.

### Step 6: Create Commit
Generate a commit message following this exact format:
```
<type>(<scope>): <description>

[optional body explaining the specific changes made in this session]

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

Execute the commit using heredoc:
```bash
git commit -m "$(cat <<'EOF'
<your commit message here>
EOF
)"
```

### Step 7: Verify Commit
```bash
git log -1 --stat
```
Confirm the commit contains only the intended changes.

### Step 8: Final Verification (MANDATORY)
After committing, perform a comprehensive verification to ensure EVERYTHING from your session is committed and NOTHING extra was included:

```bash
# Check current uncommitted status
git status --porcelain
```

**CRITICAL VERIFICATION CHECKLIST:**
1. **Session Work Committed**: Verify that ALL files you modified/created/deleted in this session are NOT listed in git status
2. **No Extra Changes**: Confirm that any remaining uncommitted files (marked with M, A, D, ??) are NOT from your session work
3. **Complete Coverage**: Cross-reference your session changes against the commit content:
   ```bash
   git show --name-only HEAD  # Show files in your commit
   ```
4. **Explicit Confirmation**: State clearly: "All changes from this session are committed. Remaining uncommitted files are user's independent changes."

**If any session changes are still uncommitted:**
- Identify what was missed
- Stage those specific files
- Amend the commit or create a follow-up commit
- Never leave session work uncommitted

## Commit Message Guidelines

### Type Selection (MANDATORY)
Choose the type that best describes the PRIMARY change:
- `feat`: New feature or functionality added in this session
- `fix`: Bug fix or error correction made in this session
- `refactor`: Code restructuring without changing functionality
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `docs`: Documentation updates
- `style`: Formatting, missing semicolons, etc.
- `chore`: Maintenance tasks, dependency updates

### Scope Selection (MANDATORY)
Choose from these project-specific scopes:
- `gamification`: XP, points, achievements, badges
- `subscription`: Stripe, payment, tier management
- `cv-analysis`: CV parsing, analysis, improvement scoring
- `auth`: Authentication, authorization, sessions
- `ui`: Components, styling, user interface
- `api`: Backend endpoints, server logic
- `db`: Database schema, migrations, queries
- `architecture`: System design, major structural changes

### Description Rules
- Start with lowercase
- No period at the end
- Use imperative mood ("add" not "added")
- Maximum 50 characters
- Focus on WHAT changed in this session

## Critical Rules

1. **Session Scope Only**: NEVER commit changes that weren't made in the current conversation
2. **No Blind Commits**: Always review diffs before staging
3. **Selective Staging**: Never use `git add .` - always specify files
4. **Verify Before Commit**: Always check staged changes match intended changes
5. **Atomic Commits**: Each commit should represent one logical unit of work
6. **Complete Verification**: MANDATORY final check that ALL session work is committed and NOTHING is left behind
7. **Explicit Confirmation**: Always state clearly what is committed vs. what remains uncommitted and why

## Error Handling

If you encounter:
- **Unrelated changes**: DO NOT stage them. Only stage session-specific changes
- **Merge conflicts**: Stop and inform the user before proceeding
- **Large diffs**: Break into multiple logical commits if appropriate
- **Unclear changes**: Ask for clarification before committing

## Example Execution

For a session where you:
1. Fixed a bug in the CV analysis API
2. Updated related tests

You would:
```bash
# Check status
git status
git diff --stat

# Review specific changes
git diff app/api/cv/analyze/route.ts
git diff tests/api/cv-analysis.test.ts

# Stage only these files
git add app/api/cv/analyze/route.ts tests/api/cv-analysis.test.ts

# Verify staged changes
git diff --cached

# Commit with appropriate message
git commit -m "$(cat <<'EOF'
fix(cv-analysis): resolve parsing error for PDF files with special characters

- Added proper encoding handling in PDF parser
- Updated error messages for better debugging
- Added test case for special character handling

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Verify commit
git log -1 --stat
```

## Remember
You are creating a commit for ONLY the work done in THIS session. Be selective, be careful, and always verify.

*Last tested: January 31, 2025*