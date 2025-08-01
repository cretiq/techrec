# Revisit Plan - Critical Analysis Command

## Purpose
This command instructs the AI to perform a comprehensive, critical review of any proposed plan to ensure maximum confidence, minimize risks, and identify potential issues before implementation.

## Command

```
I want you to revisit this plan with a critical eye, and make absolutely sure that you, with 100% confidence know that what you will change will fix the problem.

**CRITICAL ANALYSIS FRAMEWORK:**

### 1. PROBLEM VERIFICATION
- Restate the exact problem in your own words
- Verify you understand the root cause, not just symptoms  
- List all assumptions you're making about the current state
- Identify what evidence supports these assumptions
- Rate your confidence in problem understanding: ___/100

### 2. SOLUTION DECOMPOSITION
For each proposed change:
- What exactly will this change do?
- Why will this specific change solve the specific problem?
- What could go wrong with this change?
- What are the dependencies and prerequisites?
- What happens if this change fails partially?

### 3. RISK ASSESSMENT
- **Breaking Changes**: What existing functionality might break?
- **Edge Cases**: What unusual scenarios haven't been considered?
- **Dependencies**: What external systems/components could fail?
- **Rollback Plan**: How can changes be undone if they fail?
- **Testing Strategy**: How will you verify the fix works?

### 4. ALTERNATIVE ANALYSIS
- What other approaches could solve this problem?
- Why is your chosen approach better than alternatives?
- What would be the simplest possible fix?
- Is there a lower-risk incremental approach?

### 5. CONFIDENCE CALIBRATION
Rate your confidence (0-100) for each statement:
- I understand the root cause: ___/100
- This solution will fix the problem: ___/100  
- This solution won't break existing functionality: ___/100
- I can implement this solution correctly: ___/100
- The risks are acceptable: ___/100

**MINIMUM CONFIDENCE THRESHOLD: 90/100 for all areas**

### 6. DECISION CRITERIA
Only proceed if:
- [ ] Problem is clearly understood with evidence
- [ ] Solution directly addresses root cause
- [ ] Risks are identified and mitigated
- [ ] Rollback plan exists
- [ ] All confidence ratings are 90+ 
- [ ] You can explain the fix to someone else clearly

### 7. REVISION REQUIREMENT
If any confidence rating is below 90 or criteria are unmet:
- **STOP and revise the plan**
- Identify specific gaps in understanding
- Propose additional investigation steps
- Do not proceed with uncertain solutions

**Remember: It's better to take more time investigating than to implement a solution that might fail or cause additional problems.**
```

## Usage Notes

- Use this command before implementing any complex changes
- Particularly valuable for critical system modifications
- Helps identify potential issues before they become problems  
- Encourages thorough understanding over quick fixes
- Forces explicit confidence assessment and risk evaluation

## Example Application

```
Current Plan: Update API endpoint to fix data display issue

[Apply Critical Analysis Framework]

1. Problem Verification: 
   - Component shows blank instead of user data
   - Confidence in root cause: 85/100 (need more investigation)

2. Risk Assessment:
   - Could break authentication flow
   - Might affect other components using same endpoint
   
3. Decision: Confidence below 90 - need more investigation first
```

This framework ensures systematic evaluation and prevents hasty implementations that could introduce new problems.