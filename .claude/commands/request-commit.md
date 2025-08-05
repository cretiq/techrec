Analyze all changes and create logical commits for implemented features from requests.md with excellent traceability:

## Feature Implementation Commit Strategy
This process is used AFTER implementing a feature request from requests.md and BEFORE marking it as done. The goal is maximum traceability between your commits and the planned feature requests.

## Single Commit Per Feature Request Preference
**Default approach**: Create ONE comprehensive commit per feature request that includes all related changes. This provides:
- Clear feature boundaries and atomic implementation
- Simplified git history with direct feature traceability
- Complete feature context in a single commit
- Easier rollback and feature management

**Multiple commits only when necessary**: Split commits only for compelling technical reasons:
- **Breaking changes**: When feature requires database migrations or breaking API changes that should be separate
- **Large refactors**: When significant existing code restructuring is needed before feature implementation
- **Critical dependencies**: When foundational changes must be stable before building the feature
- **Review complexity**: When a single commit would be too large to review effectively (>50 files or major architectural changes)

## Comprehensive Change Analysis
Think hard about organizing commits to clearly show what feature request was implemented:

### 1. FEATURE REQUEST ALIGNMENT
First, identify which Feature Request from requests.md was implemented:
- **Primary Feature Request**: The main feature request being implemented (e.g., "Feature Request #5: Cover Letter Application Routing")
- **Supporting Components**: Related components or dependencies that were needed
- **Feature Scope**: Which acceptance criteria and technical implementation details were completed

### 2. CHANGE CATEGORIZATION
Analyze all modified files and group changes by logical purpose within the feature context:
- **Core feature implementation**: Main functionality matching the feature request's technical approach
- **UI/UX components**: New components, styling, and user interface elements
- **Backend/API changes**: Server-side logic, database changes, API modifications  
- **Type definitions**: Interface updates, type extensions for the feature
- **Integration points**: Connections with existing systems or components
- **Tests**: Feature-specific tests, validation, and quality assurance
- **Documentation**: Feature documentation, code comments, implementation notes

### 3. COMMIT ORGANIZATION STRATEGY
**Primary approach - Single comprehensive commit**:
- **Feature-complete commit**: Include all changes that implement the feature request
- **Holistic implementation**: Types, backend, frontend, tests, and documentation together
- **Complete functionality**: Ensure the feature is fully working in the single commit
- **Atomic feature boundary**: All changes relate to the same feature request

**Alternative approach - Multiple commits (only when necessary)**:
- **Technical necessity**: Only when compelling technical reasons exist (see above)
- **Dependency order**: Foundation components first, then features that build on them
- **Logical progression**: Each commit should represent a complete, stable increment
- **Feature traceability**: All commits should reference the same feature request

### 4. COMMIT MESSAGE EXCELLENCE WITH FEATURE TRACEABILITY
For each commit, create messages that clearly reference the implemented feature request:

#### Format: `type(scope): description [FR #X]`

**Types** (prioritized for feature implementation):
- `feat`: New feature implementation (most common for feature requests)
- `refactor`: Code improvements supporting the feature
- `test`: Tests for the implemented feature
- `docs`: Documentation for the implemented feature
- `chore`: Dependencies, configuration, or setup for the feature
- `style`: Styling and UI changes for the feature
- `fix`: Bug fixes discovered during feature implementation

**Scope** (recommended - use feature context):
- Component or area related to the feature (e.g., `cover-letter`, `company-search`, `application-routing`)
- Use scope from the feature request's technical approach when possible

**Description**:
- Use imperative mood: "add", "implement", "create" (not "added", "implemented", "created")
- Reference the specific feature capability being added
- Start with lowercase letter, no period at the end
- Maximum 50 characters for the first line

**Feature Request Reference [FR #X]**:
- ALWAYS include the feature request number at the end: `[FR #5]`
- This creates clear traceability to requests.md
- Enables easy cross-referencing between commits and planning documents

#### Extended Message Format:
```
type(scope): brief description [FR #X]

Feature implementation details (≤72 chars per line):
- Implements [specific acceptance criteria from feature request]
- Technical approach: [brief summary of implementation method]
- Components: [key components/files modified]
- Integration: [how this connects with existing system]
- Testing: [validation and quality assurance included]

Relates to Feature Request #X in requests.md
```

### 5. COMPREHENSIVE FILE SCANNING (MANDATORY)
**🚨 CRITICAL STEP**: Before any commit, perform thorough file scanning to capture ALL session work.

#### Mandatory Pre-Commit File Audit:
```bash
# 1. Check ALL modified and untracked files
git status --porcelain
git ls-files --others --exclude-standard

# 2. Review each file for session relevance
# 3. Include ALL session-related files
```

#### Session File Categories to Include:
**Analysis & Investigation Files**:
- API response files read/analyzed during debugging
- Data files examined to understand system behavior
- Configuration files modified during testing
- Log files or debug output generated during work

**Implementation Artifacts**:
- All source code files created or modified
- Test files and test coverage reports generated
- Type definitions and interface updates
- Documentation or comments added

**Development Tools & Scripts**:
- Build or deployment scripts created
- Debug utilities or helper scripts
- Package.json changes from dependency installations
- Any temporary files that provide session context

**Debugging & Research Work**:
- Files opened to understand existing functionality
- Reference materials or examples studied
- External API responses or data samples analyzed
- Screenshots or diagnostic files created

#### Verification Checklist (Complete BEFORE committing):
- [ ] Reviewed ALL files from `git status --porcelain`
- [ ] Checked ALL untracked files for session relevance
- [ ] Included files read/analyzed during debugging sessions
- [ ] Included generated artifacts (tests, coverage, logs, screenshots)
- [ ] Included configuration or data files modified during work
- [ ] Included any scripts or tools created during session
- [ ] Verified complete audit trail of session work is captured
- [ ] No session-related files left unstaged

#### Common Files Often Missed:
- **Data/API files**: JSON responses, CSV data, configuration files examined
- **Generated files**: Test coverage, build artifacts, compiled assets
- **Investigation artifacts**: Log files, debug output, temporary analysis files
- **Package files**: package.json, package-lock.json from dependency work
- **Documentation**: README updates, inline comments, debug notes

**⚠️ RULE**: If you touched, read, analyzed, created, or modified a file during the session, it MUST be included in the commit unless it's explicitly excluded (like node_modules, .env files, etc.).

### 6. EXECUTION INSTRUCTIONS
**For single commit (preferred approach)**:

1. **Complete mandatory file scanning** (Section 5 above):
   - Run git status audit commands
   - Complete verification checklist
   - Identify ALL session-related files

2. **Stage all session files**:
   ```bash
   git add [all files from comprehensive scanning - NO EXCEPTIONS]
   ```

3. **Create comprehensive feature commit**:
   ```bash
   git commit -m "feat(scope): implement complete feature [FR #X]
   
   Feature implementation details:
   - Implements [all acceptance criteria]
   - Technical approach: [comprehensive implementation summary]
   - Components: [all files/components modified]
   - Integration: [complete system connections]
   - Testing: [all validation and quality assurance]
   
   Relates to Feature Request #X in requests.md"
   ```

**For multiple commits (only when necessary)**:

1. **Complete mandatory file scanning** (Section 5 above):
   - Run git status audit commands  
   - Complete verification checklist
   - Identify ALL session-related files

2. **Stage specific files for each logical component**:
   ```bash
   git add [specific files for this feature component - from complete scan]
   ```

3. **Create feature-traceable commit**:
   ```bash
   git commit -m "feat(scope): implement feature component [FR #X]
   
   Feature implementation details:
   - Implements [specific acceptance criteria]
   - Technical approach: [brief implementation summary]
   - Components: [key files/components modified]
   - Integration: [how this connects with existing system]
   
   Relates to Feature Request #X in requests.md"
   ```

4. **Verify feature alignment**:
   - Ensure commit aligns with feature request acceptance criteria
   - Check that commit message references the correct Feature Request #X
   - Confirm changes match the technical approach from the feature request
   - Verify no unrelated changes are included

### 7. QUALITY STANDARDS FOR FEATURE IMPLEMENTATION
Each commit must meet these criteria:
- **Feature-aligned**: Directly implements part of a planned feature request
- **Traceable**: References Feature Request #X for clear planning connection
- **Atomic**: Contains only changes belonging to this feature request
- **Complete**: Doesn't break the build or leave the feature incomplete
- **Descriptive**: Commit message clearly maps to acceptance criteria
- **Reviewable**: Changes can be understood in context of the feature request

### 8. EXAMPLES OF EXCELLENT FEATURE IMPLEMENTATION COMMITS

**Single Comprehensive Commit (Preferred)**:
```
feat(cover-letter): implement application routing workflow [FR #5]

Implements complete cover letter application routing feature:
- Technical approach: Secondary application button with preserved context
- Components: ApplicationBadge, ApplicationActionButton, routing logic
- Integration: New tab navigation, company/role info preservation
- Testing: Button placement validation, context preservation tests
- UI: Bottom placement in company info box, consistent styling

Relates to Feature Request #5 in requests.md
```

**Multiple Commits (Only When Necessary)**:
```
refactor(types): extend Role interface for application data [FR #2]

Implements foundational type definitions for application routing:
- Technical approach: Add directapply, recruiter, hiring manager fields
- Components: Updated Role interface, ApplicationInfo type
- Integration: Supports mapRapidApiJobToRole data transformation
- Next: Enables smart application routing UI components

Relates to Feature Request #2 in requests.md
```

```
feat(application-routing): implement smart routing UI [FR #2]

Implements complete application routing user interface:
- Technical approach: Smart routing based on application type
- Components: ApplicationActionButton, routing logic, UI components
- Integration: Uses extended Role interface, connects with existing flows
- Testing: Routing validation, UI interaction tests

Relates to Feature Request #2 in requests.md
```

### 9. COMMIT VERIFICATION & FEATURE ALIGNMENT
Before finalizing each commit:
- **Complete file scanning verification**: Confirm ALL session files are included (Section 5 checklist)
- **Review staged changes**: Ensure all session-related changes are captured, no files missed
- **Verify feature reference**: Confirm commit message includes correct [FR #X] reference
- **Test functionality**: Verify the commit doesn't break existing functionality or feature integration
- **Check acceptance criteria**: Ensure commit aligns with specific acceptance criteria from the feature request
- **Validate completeness**: Confirm commit represents complete feature implementation or logical component
- **Audit session artifacts**: Verify analysis files, debugging work, and investigation materials are included

### 10. WORKFLOW INTEGRATION
This commit process integrates with your feature development workflow:

#### Before Committing:
1. **Implement feature** following the technical approach from requests.md
2. **Run this request-commit process** to create traceable commits
3. **Verify all acceptance criteria** are implemented

#### After Committing:
1. **MOVE FEATURE TO COMPLETED SECTION** - This is mandatory:
   - Move the feature request from "Active Feature Requests" to "Recently Completed Features" section in requests.md
   - Include completion date, impact assessment, key learnings, and implementation notes
   - Reference the commits created in the implementation notes
2. **UPDATE TABLE OF CONTENTS** - Required when changing document structure:
   - Update the TOC in requests.md when moving features between sections
   - Add new entries for any new feature requests or sections created
   - Remove entries for any sections that were removed or renamed
   - Ensure all anchor links match the actual header names exactly
3. **Update cursor rule** to reflect new active feature count if needed

#### Required Post-Implementation Step:
**🔄 CRITICAL**: After creating commits for a feature request, you MUST move it from the "Active Feature Requests" section to the "Recently Completed Features" section in requests.md. This maintains accurate project status and prevents confusion about which features are still in development.

#### Traceability Chain:
```
Feature Request #X (requests.md - Active)
    ↓ (implementation)
Commits with [FR #X] reference (git history)
    ↓ (completion - REQUIRED STEP)
Recently Completed Features (requests.md - Completed)
```

This creates a complete audit trail from planning → implementation → completion, making it easy to understand what was built, when, and why.

Focus on creating commits that clearly trace back to planned feature requests, enabling seamless project history navigation and feature lifecycle tracking. **Prefer single comprehensive commits per feature request** for cleaner git history and better feature boundaries.