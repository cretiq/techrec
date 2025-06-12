# Data TestID Strategic Naming Convention

## Overview
This document defines the comprehensive, scalable naming strategy for `data-testid` attributes across the TechRec application. This system enables efficient debugging, automated testing, and element identification.

## Naming Convention Structure

```
data-testid="[domain]-[feature]-[component]-[variant?]-[action?]"
```

### Core Patterns

#### 1. Domain Prefixes
- `auth-` - Authentication & login systems
- `cv-` - CV management, analysis, and processing
- `role-` - Job roles, search, and applications
- `write-` - Writing assistance tools (cover letters, outreach)
- `profile-` - User profile management
- `nav-` - Navigation elements and menus
- `ui-` - Generic UI components

#### 2. Feature Identifiers
- `management-` - Management interfaces (CRUD operations)
- `analysis-` - Analysis and scoring systems
- `search-` - Search and filtering interfaces
- `coverletter-` - Cover letter generation
- `upload-` - File upload functionality
- `dashboard-` - Dashboard and overview pages

#### 3. Component Types
- `card` - Container/card components
- `button` - Interactive buttons
- `input` - Form input fields
- `table` - Data tables and lists
- `modal` - Overlays and dialogs
- `container` - Wrapper elements
- `display` - Data display components
- `nav` - Navigation components
- `form` - Form components

#### 4. Variant Specifiers
- `header` - Header sections
- `content` - Main content areas
- `footer` - Footer sections
- `item` - Individual list/collection items
- `row` - Table rows
- `cell` - Table cells
- `section` - Content sections

#### 5. Action Suffixes
- `-trigger` - Elements that trigger actions (buttons, links)
- `-container` - Wrapper/grouping elements
- `-item` - Individual items in collections
- `-loading` - Loading state indicators
- `-error` - Error state displays
- `-success` - Success state indicators

## Implementation by Feature Area

### 1. CV Management (`cv-management-`)

#### Upload Components
```
cv-management-card-upload
cv-management-upload-form-container
cv-management-upload-dropzone
cv-management-button-upload-trigger
cv-management-upload-file-input
cv-management-upload-status-text
```

#### CV List Components
```
cv-management-table-cv-list
cv-management-row-cv-item-{cvId}
cv-management-cell-filename-{cvId}
cv-management-button-analyze-{cvId}
cv-management-button-download-{cvId}
cv-management-button-delete-{cvId}
```

### 2. CV Analysis (`cv-analysis-`)

#### Dashboard Components
```
cv-analysis-dashboard-container
cv-analysis-card-overall-score
cv-analysis-button-get-suggestions-trigger
cv-analysis-progress-overall-score
cv-analysis-card-section-{sectionName}
cv-analysis-score-section-{sectionName}-percentage
```

### 3. Role Search (`role-search-`)

#### Search Interface
```
role-search-container-filters
role-search-input-keyword
role-search-input-location
role-search-button-search-trigger
role-search-container-results
role-search-card-role-item-{roleId}
```

#### Role Actions
```
role-search-button-apply-trigger-{roleId}
role-search-button-save-trigger-{roleId}
role-search-button-write-trigger-{roleId}
role-search-button-select-visible-trigger
```

### 4. Writing Help (`write-`)

#### Cover Letter Creator
```
write-coverletter-card-header
write-coverletter-button-generate-trigger
write-coverletter-card-customization
write-coverletter-container-achievements
write-coverletter-input-job-source
write-coverletter-button-export-trigger
write-coverletter-button-copy-trigger
```

#### Navigation & Tabs
```
write-nav-tabs-main
write-nav-tab-cv-trigger
write-nav-tab-cover-letter-trigger
write-nav-tab-outreach-trigger
write-button-generate-all-trigger
```

## Dynamic ID Patterns

### Entity-Specific IDs
For items that represent specific entities (CVs, roles, users), include the entity ID:

```
{feature}-{component}-{entityType}-{entityId}

Examples:
cv-management-row-cv-item-123
role-search-card-role-item-456
profile-card-achievement-item-789
```

### Section-Specific IDs
For components that relate to specific sections or categories:

```
{feature}-{component}-section-{sectionName}

Examples:
cv-analysis-card-section-skills
cv-analysis-progress-experience-score
profile-form-section-education
```

## State-Based Variations

### Loading States
```
{base-id}-loading
{base-id}-spinner-{context}

Examples:
cv-management-button-upload-loading
role-search-spinner-search-loading
```

### Error States
```
{base-id}-error
{base-id}-error-message

Examples:
cv-analysis-display-error
upload-form-error-message
```

### Success States
```
{base-id}-success
{base-id}-success-message

Examples:
cv-upload-status-success
role-application-success-indicator
```

## Browser DevTools Usage

### Finding Elements
```javascript
// In browser console:
document.querySelector('[data-testid="cv-management-button-upload-trigger"]')

// For dynamic IDs:
document.querySelector('[data-testid^="role-search-card-role-item-"]')

// Multiple elements:
document.querySelectorAll('[data-testid*="section-skills"]')
```

### Testing Framework Integration
```javascript
// Cypress
cy.get('[data-testid="write-button-generate-all-trigger"]').click()

// Testing Library
screen.getByTestId('cv-analysis-card-overall-score')

// Playwright
page.locator('[data-testid="role-search-input-keyword"]')
```

## IDE Integration

### Quick Search Strategies
1. **Search by feature**: `data-testid="cv-management-` finds all CV management elements
2. **Search by component**: `data-testid="*-button-*-trigger"` finds all trigger buttons
3. **Search by entity**: `data-testid="*-role-item-*"` finds all role-related items

### VS Code Snippets
```json
{
  "testid-button": {
    "prefix": "tid-btn",
    "body": "data-testid=\"${1:domain}-${2:feature}-button-${3:name}-trigger\""
  },
  "testid-card": {
    "prefix": "tid-card",
    "body": "data-testid=\"${1:domain}-${2:feature}-card-${3:name}\""
  }
}
```

## Maintenance Guidelines

### Adding New Components
1. Identify the domain and feature area
2. Determine the component type
3. Check for similar existing patterns
4. Follow the naming convention structure
5. Document any new patterns

### Updating Existing Components
1. Maintain backward compatibility when possible
2. Update related components consistently
3. Document breaking changes
4. Provide migration guides for tests

### Best Practices
- Use kebab-case for all segments
- Keep names descriptive but concise
- Avoid abbreviations unless universally understood
- Group related elements with consistent prefixes
- Use dynamic IDs for entity-specific elements

## Testing Integration

### Automated Testing
The data-testid attributes enable robust automated testing across:
- Unit tests (Jest + Testing Library)
- Integration tests (Cypress)
- E2E tests (Playwright)
- Visual regression tests

### Analytics Integration
Elements can be tracked for user behavior analytics:
```javascript
// Track button clicks
document.querySelectorAll('[data-testid*="button"][data-testid*="trigger"]')
  .forEach(btn => btn.addEventListener('click', trackEvent))
```

## Quick Reference by Page

### CV Management
- Upload: `cv-management-upload-*`
- List: `cv-management-table-*` / `cv-management-row-*`
- Actions: `cv-management-button-{action}-{cvId}`

### Role Search
- Filters: `role-search-container-filters` / `role-search-input-*`
- Results: `role-search-card-role-item-{roleId}`
- Actions: `role-search-button-{action}-{roleId}`

### Writing Help
- Navigation: `write-nav-*`
- Cover Letters: `write-coverletter-*`
- Bulk Actions: `write-button-*-all-*`

### Analysis
- Dashboard: `cv-analysis-dashboard-*`
- Sections: `cv-analysis-card-section-{section}`
- Scores: `cv-analysis-progress-{section}-score`

This strategic naming system provides a scalable, predictable foundation for element identification across the entire TechRec application.