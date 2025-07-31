# CvAnalysis Table Removal Plan

Complete removal of obsolete CvAnalysis table and related code after migration to single source of truth architecture.

## 🎯 **Removal Scope**

### ✅ **SAFE TO REMOVE**
- **CvAnalysis table data** - All records in the CvAnalysis collection
- **CvAnalysis model** - Prisma schema model definition
- **Deprecated API endpoints** - Routes that directly access CvAnalysis
- **Related types** - TypeScript interfaces for CvAnalysis
- **Obsolete utility functions** - Functions that manipulate CvAnalysis data

### 🚫 **MUST PRESERVE**
- **User authentication** - All login data and sessions
- **Profile data** - Developer, Experience, Education, Skills, etc.
- **CV file metadata** - CV table records (S3 keys, upload status)
- **Gamification data** - XP, points, badges, achievements
- **Application data** - Saved roles, applications, subscriptions

## 📋 **Execution Steps**

### Step 1: Data Cleanup (SAFE)
```bash
# Dry run first (safe preview)
node scripts/cleanup-obsolete-cvanalysis.js

# Actual deletion (requires confirmation)
CONFIRM_DELETION=true DRY_RUN=false node scripts/cleanup-obsolete-cvanalysis.js
```

### Step 2: Schema Update
```diff
// Remove from prisma/schema.prisma
- model CvAnalysis {
-   id           String    @id @default(auto()) @map("_id") @db.ObjectId
-   developerId  String    @db.ObjectId
-   // ... entire model definition
-   @@map("CvAnalyses")
- }

// Remove relation from Developer model  
model Developer {
  // ... other fields
- cvAnalyses      CvAnalysis[]
}

// Remove relation from CV model
model CV {
  // ... other fields  
- analysisId      String?       @unique
- analysis        CvAnalysis?   
}
```

### Step 3: Generate Updated Prisma Client
```bash
npx prisma generate
npx prisma db push  # Updates database schema
```

### Step 4: Remove Deprecated API Endpoints
```bash
# Remove these endpoint files:
rm app/api/cv-analysis/[id]/save-version/route.ts
rm app/api/cv-analysis/[id]/route.ts  
rm app/api/cv-analysis/route.ts
rm app/api/cv-analysis/export/route.ts
# Keep: app/api/cv-analysis/latest/route.ts (for compatibility)
```

### Step 5: Update TypeScript Types
```diff
// Remove from types/cv.ts or similar
- export interface CvAnalysisData {
-   // ... interface definition
- }
```

### Step 6: Cleanup Utility Functions
```bash
# Review and remove obsolete functions in:
utils/cvOperations.ts
utils/backgroundProfileSync.ts
```

## 🔍 **Verification Checklist**

### Database Verification
- [ ] CvAnalysis collection is empty
- [ ] Developer records intact
- [ ] Experience records intact  
- [ ] Education records intact
- [ ] Skills records intact
- [ ] CV file metadata intact
- [ ] Authentication data intact

### Application Verification  
- [ ] CV upload works correctly
- [ ] Profile display works correctly
- [ ] Manual edits save properly
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] Tests pass

### API Verification
- [ ] `/api/cv-analysis/latest` works (compatibility layer)
- [ ] `/api/developer/me/profile` works
- [ ] `/api/developer/me/experience` works
- [ ] Deprecated endpoints removed
- [ ] No broken API references

## 🚀 **Execution Commands**

```bash
# 1. Run cleanup script (dry run first)
node scripts/cleanup-obsolete-cvanalysis.js

# 2. Confirm and execute data deletion
CONFIRM_DELETION=true DRY_RUN=false node scripts/cleanup-obsolete-cvanalysis.js

# 3. Update Prisma schema (manual edit)
# Remove CvAnalysis model and relations

# 4. Update database
npx prisma generate
npx prisma db push

# 5. Remove deprecated API files
rm app/api/cv-analysis/[id]/save-version/route.ts
rm app/api/cv-analysis/[id]/route.ts
rm app/api/cv-analysis/route.ts
rm app/api/cv-analysis/export/route.ts

# 6. Verify everything works
npm run lint
npm run typecheck
npm run build
npm run test
```

## ⚠️ **Safety Notes**

1. **Backup Recommended**: Although data is not sensitive, consider backup before deletion
2. **Staging First**: Test removal process in staging environment if available
3. **Gradual Approach**: Can be done step by step with verification at each stage
4. **Rollback Plan**: Keep script and schema changes in version control
5. **Team Communication**: Notify team before schema changes

## 🎉 **Expected Benefits**

- **Cleaner Architecture**: Single source of truth fully implemented
- **Reduced Complexity**: Fewer database models and API endpoints
- **Better Performance**: No redundant data storage or queries
- **Easier Maintenance**: Simplified codebase with clear data flow
- **Developer Experience**: Clear understanding of data architecture

---

*This removal plan ensures safe cleanup of obsolete CvAnalysis infrastructure while preserving all important user and application data.*