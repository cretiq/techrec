# Database Architecture (Single Source of Truth)

**✅ CRITICAL UPDATE (January 2025)**: Complete migration from redundant CvAnalysis table to proper single source of truth.

## Core Profile Tables

### Developer
User profiles with gamification fields, contact info, basic profile data

### ContactInfo  
**Relationship**: 1:1 with Developer
**Purpose**: Phone, address, social links

### Experience
**Relationship**: 1:Many with Developer
**Purpose**: Work history with responsibilities and achievements

### Education
**Relationship**: 1:Many with Developer  
**Purpose**: Educational background with dates and details

### Achievement
**Relationship**: 1:Many with Developer
**Purpose**: Certifications, awards, accomplishments

### DeveloperSkill
**Relationship**: Many:Many junction table with Skill
**Purpose**: Skill levels and categories

### Skill
**Relationship**: Master skill list with categories
**Purpose**: Consistent skill management across all developers

## File Management

### CV
**Purpose**: File metadata only
**Contains**: S3 keys, upload status, improvement scores

### ~~CvAnalysis~~ (DEPRECATED)
**Status**: No longer used, data migrated to proper profile tables
**Migration**: All data moved to Developer, Experience, Education, Skills tables

## Gamification Tables

### Core Gamification Entities
- **XPTransaction**: Experience point transactions and history
- **PointsTransaction**: Points economy transactions  
- **UserBadge**: Achievement badges earned by users
- **DailyChallenge**: Daily challenge system
- **SubscriptionTier**: Subscription level management

## Data Flow Architecture

### CV Upload → Profile Pipeline
1. **User uploads CV** → S3 storage + Direct upload to Gemini API
2. **Gemini processes raw PDF/DOCX** to preserve document structure
3. **Enhanced prompt extracts structured data** (contact, experience, skills, education)
4. **Background sync saves DIRECTLY to proper profile tables** (Developer, Experience, Education, Skills)
5. **UI fetches from proper profile APIs** (`/api/developer/me/*`)
6. **Manual edits save via `/api/developer/me/profile`** to proper tables
7. **Results cached in Redis** with semantic keys (24-hour TTL)
8. **Gamification updates** (XP awards, achievement checks)

## Single Source of Truth Benefits

### Data Consistency
- No duplicate data across tables
- Single update point for profile changes
- Consistent relationships across all entities

### Performance
- Direct queries to source tables
- No complex joins across analysis tables
- Efficient caching of profile data

### Maintainability  
- Clear data ownership
- Simplified backup/restore procedures
- Easier schema evolution

## API Integration

### Profile CRUD Operations
- `/api/developer/me/profile` - Complete profile CRUD (single source of truth)
- `/api/developer/me/experience` - Experience CRUD operations
- `/api/developer/me/education` - Education CRUD operations  
- `/api/developer/me/skills` - Skills CRUD operations
- `/api/developer/me/achievements` - Achievements CRUD operations

## Related Documentation

- **API Route Structure**: See CLAUDE.md for complete API patterns
- **CV Analysis Flow**: See CLAUDE.md for upload workflow
- **State Management**: See CLAUDE.md for Redux slice patterns