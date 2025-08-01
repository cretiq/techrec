# Bug Analyzer Command

> **AI Bug Analysis Workflow** - Structured command for analyzing, searching, and resolving bugs using the TechRec bug database.

## Usage

When you encounter a bug, copy and paste this command template:

---

## 🔍 BUG ANALYSIS REQUEST

**Bug Symptoms**: [Describe what's happening - loading forever, error messages, UI issues, etc.]

**Component Type**: [Frontend/Backend/Database/Integration]

**Error Messages**: 
```
[Paste console errors, stack traces, or error messages here]
```

**Current Context**: [What were you working on when this occurred?]

---

## 🤖 AI ANALYSIS INSTRUCTIONS

**Step 1: Search Bug Database**
1. Search `docs/implementation/bug-reporting-resolution.md` for similar symptoms
2. Use these search patterns:
   - If "loading forever" → Search for: #redux-loading #status-stuck
   - If "cannot read property" → Search for: #api-undefined #null-check
   - If "hydration mismatch" → Search for: #hydration-mismatch #redux-persist
   - If "slow queries" → Search for: #n-plus-one #database-performance
   - If "type errors" → Search for: #type-mismatch #api-validation

**Step 2: If Similar Bug Found**
1. Show the matching bug pattern from database
2. Copy the exact "Code Pattern" solution
3. Implement the fix using the provided pattern
4. Verify the fix works
5. Note: "Applied pattern from bug database: [Bug Title]"

**Step 3: If New Bug (Not Found)**
1. Investigate systematically:
   - Check console errors
   - Verify data flow
   - Test in isolation
   - Identify root cause

2. Document the new bug using this template:
```markdown
### Bug: [Brief Description] [#tag1 #tag2 #category]
**Quick Fix**: [One-line solution]
**Component**: [Frontend/Backend/Database]
**Recurrence Risk**: [High/Medium/Low]
**Resolution Time**: [Actual time spent]

**Root Cause**: [Why it happened]
**Prevention**: [How to avoid it]

**Code Pattern**:
```typescript
// ✅ Working solution
// ❌ What doesn't work
```

**AI Search Terms**: [Keywords AI should search for]
**Prevention Checklist**: [What to check in future]
```

3. Add this new bug to the bug database
4. Update the search tags index if needed
5. Add prevention checklist item

**Step 4: Prevention Update**
1. Update relevant prevention checklist in bug database
2. Add new pattern to avoid list if applicable
3. Test that solution prevents recurrence

---

## 🎯 Quick Command Variations

### For Redux Issues
```
BUG ANALYSIS: Redux component stuck loading
Component: Frontend-Redux
Search tags: #redux-loading #status-stuck #state-management
```

### For API Issues
```
BUG ANALYSIS: API returning unexpected data structure
Component: Backend-API
Search tags: #api-undefined #type-mismatch #response-format
```

### For Database Issues
```
BUG ANALYSIS: Slow database queries
Component: Backend-Database
Search tags: #n-plus-one #prisma-relation #database-performance
```

### For UI Issues
```
BUG ANALYSIS: Component rendering errors
Component: Frontend-UI
Search tags: #render-loop #null-check #loading-forever
```

## 📋 Expected AI Response Format

```markdown
## Bug Analysis Results

### 🔍 Database Search Results
- **Found similar bug**: [Yes/No]
- **Matching pattern**: [Bug title if found]
- **Search tags used**: [Tags searched]

### 🛠️ Resolution Applied
- **Solution used**: [From database/New investigation]
- **Code changes**: [Brief description]
- **Prevention steps**: [What was added to prevent recurrence]

### 📝 Database Updates
- **New bug added**: [Yes/No]
- **Prevention checklist updated**: [Yes/No]
- **Search tags updated**: [Yes/No]

### ✅ Verification
- **Fix tested**: [Yes/No]
- **No regressions**: [Yes/No]
- **Pattern works**: [Yes/No]
```

## 🔧 Advanced Usage

### For Recurring Issues
If you've seen this bug before but can't find it in the database:
```
BUG ANALYSIS: [Description]
Note: This feels familiar but not in database
Please search thoroughly and consider if this is a variant of an existing pattern
```

### For Performance Issues
```
BUG ANALYSIS: [Description]
Focus: Performance and optimization
Search for: #performance #database-performance #query-optimization
```

### For Integration Issues
```
BUG ANALYSIS: [Description]
Component: Integration between [X] and [Y]
Search for: #integration #api-integration #data-flow
```

## 🎓 Learning Mode

For complex bugs that teach new patterns:
```
BUG ANALYSIS: [Description]
Learning mode: Yes
Please document this thoroughly as it may be a new pattern
Include detailed prevention steps and multiple search terms
```

---

## 💡 Pro Tips

1. **Always start with search** - Don't investigate before checking the database
2. **Use specific search terms** - Match your symptoms to the tag categories
3. **Copy exact patterns** - Don't modify working solutions from the database
4. **Update immediately** - Add new bugs to database while fresh in memory
5. **Test thoroughly** - Verify fix works and doesn't break anything else

---

*This command ensures systematic bug resolution and prevents solving the same issues repeatedly.* 