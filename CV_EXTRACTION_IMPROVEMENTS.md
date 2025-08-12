# CV Extraction Improvements Plan

## Core Problems to Solve
- AI extraction is inconsistent and unpredictable
- Every CV has different structure/formatting
- Nested projects vs flat roles confusion
- Users need control over final structure

## Desired Capabilities

### 1. Re-Analysis Features
- Re-analyze existing CV without re-uploading file
- Try different AI models or prompts on same file
- Keep history of different extraction attempts
- Let user pick best extraction result

### 2. Experience Organization
- Drag-and-drop to reorder experiences
- Nest experiences as projects under parent roles
- Unnest projects back to top-level experiences
- Visual hierarchy showing parent/child relationships

### 3. Role Merging
- Select multiple roles to merge into one
- Combine responsibilities from both roles
- Merge overlapping date ranges intelligently
- Preserve all bullet points during merge

### 4. Smart Grouping Assistance
- Auto-detect same company with different roles
- Suggest potential merges/nesting
- Highlight potential duplicate entries
- One-click acceptance of suggestions

### 5. Manual Corrections
- Edit any extracted field inline
- Add missing experiences/projects
- Delete incorrect extractions
- Split combined entries apart

### 6. Save & Version Control
- Save reorganized structure permanently
- Undo/redo capability for changes
- Reset to original extraction if needed
- Export final structure

## Success Criteria
- Users can fix AI extraction errors easily
- No data loss during reorganization
- Changes persist across sessions
- Intuitive UI that doesn't require instructions

## Technical Considerations
- Store original extraction separately from user edits
- Need robust state management for drag-and-drop
- Database schema must support nested relationships
- API endpoints for all reorganization operations