# Database Migration Plan: Personal vs Professional Projects Implementation

## Overview
This migration implements support for TWO distinct types of projects:
1. **Personal Projects**: Individual portfolio projects (apps, open source, etc.) - ALREADY RENAMED ✅
2. **Professional Projects**: Client projects within work experience (from Gemini `experience.projects[]`)

## Terminology Clarification
- **Personal Projects**: Individual developer's portfolio projects, showcased separately
- **Professional Projects**: Projects worked on during professional experience at companies

## Current State Analysis

### ✅ COMPLETED: Personal Project Tables (Renamed)
- **PersonalProject** - Individual portfolio projects (renamed from Project)
- **PersonalProjectPortfolio** - AI-powered portfolio enhancement (renamed from ProjectPortfolio)
- **PersonalProjectEnhancement** - Enhancement records for portfolios (renamed from ProjectEnhancement)

### 🔍 PROFESSIONAL PROJECTS STRUCTURE (From Gemini Response)
Based on recent Direct Gemini Upload logs, professional projects have this structure:
```json
"projects": [
  {
    "name": "HomeKeepr",
    "description": "HomeKeepr is a service that helps people who moving to a new home...",
    "technologies": ["React Js"],
    "teamSize": 12,
    "role": "Frontend Engineer"
  }
]
```

### ❌ MISSING IMPLEMENTATIONS:
1. No handling of `experience.projects[]` from Gemini response (Professional Projects)
2. No ProfessionalProject table to link work projects to experience records
3. No "personalProjects" section in AI prompt to extract individual portfolio projects

## NEW Migration Strategy

### ✅ Phase 1-2: Personal Projects (COMPLETED)
- Personal project tables renamed and code updated
- PersonalProject, PersonalProjectPortfolio, PersonalProjectEnhancement working

### 📋 Phase 3: Create ProfessionalProject Table
- Create new table for professional projects within work experience
- Link to Experience via foreign key with cascading deletes
- Match Gemini response structure exactly

### 📋 Phase 4: Update AI Prompt 
- Add "personalProjects" section to extract individual portfolio projects
- Keep existing "experience.projects" for professional projects
- Distinguish between personal portfolio vs work experience projects

### 📋 Phase 5: Update Profile Sync Logic
- Handle both personal and professional projects
- Transform professional projects to ProfessionalProject table
- Keep existing ExperienceProject logic but rename to ProfessionalProject

### 📋 Phase 6: Test & Validate
- Test both personal and professional project extraction
- Verify proper separation and database relationships

---

## Detailed Step-by-Step Checklist

### ✅ PHASE 1-2: Personal Project Tables (COMPLETED)
- [x] Renamed Project → PersonalProject, ProjectPortfolio → PersonalProjectPortfolio, etc.
- [x] Updated all code references and API routes
- [x] Updated schema relationships and foreign keys
- [x] Generated and ran migrations successfully
- [x] All personal project functionality working

### ✅ PHASE 3: ExperienceProject Table (Already Complete)

#### 3.1 Keep ExperienceProject Model (Already Correct)
- [x] ExperienceProject table already exists and matches Gemini response structure:
  ```prisma
  model ExperienceProject {
    id            String @id @default(auto()) @map("_id") @db.ObjectId
    experienceId  String @db.ObjectId
    experience    Experience @relation(fields: [experienceId], references: [id], onDelete: Cascade)
    
    name          String
    description   String
    technologies  String[]  // Array of tech strings
    teamSize      Int?
    role          String?
    
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    
    @@index([experienceId])
    @@map("ExperienceProject")
  }
  ```

#### 3.2 Experience Model Relation
- [x] Experience model already has: `projects ExperienceProject[]`

#### 3.3 No Migration Needed
- [x] ExperienceProject table already exists and working
- [x] Profile sync already handles experience projects correctly

### 📋 PHASE 4: Update AI Prompt for Personal Projects

#### 4.1 Add personalProjects Section to Gemini Prompt
- [ ] Add new section to extract individual portfolio projects:
  ```json
  "personalProjects": [
    {
      "name": "string",
      "description": "string", 
      "technologies": ["string"],
      "githubUrl": "string | null",
      "liveUrl": "string | null",
      "status": "completed | in-progress | archived"
    }
  ]
  ```

#### 4.2 Update Prompt Instructions
- [ ] Distinguish between personal portfolio projects vs work experience projects
- [ ] Keep existing "experience.projects" for professional projects
- [ ] Add extraction rules for personal projects from CV sections

### 📋 PHASE 5: Update Profile Sync Logic

#### 5.1 Update backgroundProfileSync.ts
- [ ] Keep existing `transformExperienceProjects` function (already working)
- [ ] Add new `transformPersonalProjects` function:
  ```typescript
  function transformPersonalProjects(projects: any[]): any[] {
    return projects?.map(project => ({
      name: project.name || '',
      description: project.description || '',
      technologies: project.technologies || [],
      githubUrl: project.githubUrl || null,
      liveUrl: project.liveUrl || null,
      status: project.status || 'completed',
    })) || [];
  }
  ```

#### 5.2 Update transformCvToProfileData
- [ ] Add personalProjects handling to the main transformation function
- [ ] Keep existing professional projects handling within experience

#### 5.3 Update Database Operations
- [ ] Add PersonalProject create/update operations in `updateProfileDirectly`
- [ ] Keep existing ExperienceProject operations (already working)

### 📋 PHASE 6: Test & Validation

#### 6.1 Database Testing
- [ ] Start server: `npm run dev`
- [ ] Verify both PersonalProject and ExperienceProject tables exist
- [ ] Test relationships and cascading deletes

#### 6.2 CV Upload Testing  
- [ ] Enable debug: `DEBUG_CV_UPLOAD=true`
- [ ] Upload test CV with both personal and experience projects
- [ ] Verify debug logs show both types of project extraction:
  ```bash
  npx tsx scripts/analyze-direct-upload.ts
  ```
- [ ] Check database records created in correct tables

#### 6.3 Profile Sync Testing
- [ ] Verify PersonalProject records created independently
- [ ] Verify ExperienceProject records linked to Experience (already working)
- [ ] Test profile API endpoints return both project types
- [ ] Verify cascading deletes work correctly

#### 6.4 Integration Testing
- [ ] Test complete CV upload → profile sync → UI display flow
- [ ] Verify personal vs experience project separation
- [ ] Verify no regressions in existing functionality
- [ ] Run full test suite: `npm test`

---

## Risk Assessment

### 🟢 LOW RISK - Safe Operations
- Renaming tables (data is empty per requirements)
- Adding new ExperienceProject table (no existing dependencies)
- Updating isolated code references (1 query found)

### 🟡 MEDIUM RISK - Manageable
- Profile sync logic changes (well-isolated function)
- New database relationships (properly constrained)

### 🔴 HIGH RISK - None Identified
- No breaking changes to existing functionality
- No data migration required (tables empty)
- Clear separation between personal and experience projects

## Rollback Plan

### If Issues Arise:
1. **Phase 1-2 Issues**: Revert Prisma schema changes, regenerate migration
2. **Phase 3 Issues**: Drop ExperienceProject table, remove relation
3. **Phase 4 Issues**: Revert backgroundProfileSync.ts changes
4. **Phase 5 Issues**: Use debug logs to identify specific failures

### Emergency Rollback:
```bash
# Revert to last working migration
npx prisma migrate reset --skip-seed
git checkout HEAD~1 prisma/schema.prisma
npx prisma migrate dev --name "emergency-rollback"
```

---

## Success Criteria

### ✅ Completion Checklist
- [ ] All existing personal project functionality works unchanged
- [ ] CV upload extracts experience projects to database  
- [ ] Profile APIs return experience with nested projects
- [ ] Database relationships enforce integrity constraints
- [ ] Debug system shows project extraction metrics
- [ ] No test regressions or TypeScript errors
- [ ] Migration is reversible if needed

### ✅ Validation Commands
```bash
# Build check
npm run build

# Test suite  
npm test

# Database integrity
npx prisma studio

# CV upload test
DEBUG_CV_UPLOAD=true curl -X POST http://localhost:3000/api/cv/upload \
  -F "file=@tests/fixtures/KRUSHAL_SONANI.pdf"

# Debug analysis
npx tsx scripts/analyze-direct-upload.ts
```

---

*This plan ensures zero data loss, minimal risk, and clear validation steps. Each phase can be executed independently and rolled back if needed.*