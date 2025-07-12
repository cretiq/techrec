# Next Feature Analysis - AI Primer

## Your Task
You are helping identify the next best feature request to work on from the requests.md file. This is designed for intelligent analysis - you must systematically evaluate all available feature requests and provide a well-grounded recommendation based on priority, dependencies, status, and strategic value. Make data-driven decisions with clear rationale.

## Step-by-Step Analysis Process

**Process Overview:**
1. **Analysis Phase** (Steps 1-6): Evaluate all features and make recommendation
2. **Selection Phase**: User selects feature to implement
3. **Execution Preparation Phase** (Step 7): **MANDATORY consultation with @claude-instructions/execution-primer.md**
4. **Implementation Phase**: Begin detailed analysis and implementation

### Step 1: Read and Parse requests.md
**Required Analysis:**
- [ ] Read the entire "💭 Active Feature Requests" section
- [ ] Identify all feature requests with their current status
- [ ] Note all dependencies, priorities, and timeline placements
- [ ] Check the "Recently Completed Features" section to understand what was just finished
- [ ] Review any timeline sections (Immediate Next Features, Short-term Features, etc.)

**Context Gathering:**
- [ ] What features were recently completed (might unblock others)?
- [ ] What features are currently in development?
- [ ] What features are ready for implementation?
- [ ] What features are still in planning phase?

### Step 2: Dependency Analysis (CRITICAL)
**For each feature request, verify:**
- [ ] **Dependency Status**: Are all listed dependencies completed?
- [ ] **Blocking Relationships**: Is this feature blocking other high-priority features?
- [ ] **Dependency Chain**: What gets unblocked if this feature is completed?
- [ ] **Circular Dependencies**: Are there any dependency conflicts?

**Decision Logic:**
- ✅ **Available**: All dependencies are marked as completed in "Recently Completed Features"
- ⏱️ **Blocked**: One or more dependencies are still pending/in development
- ⚠️ **Partial**: Some dependencies complete, others pending (needs user clarification)

### Step 3: Status and Readiness Assessment
**Evaluate each feature's readiness:**
- [ ] **"Ready for Development"**: Fully planned, all questions resolved, technical approach clear
- [ ] **"In Development"**: Currently being worked on (might need status update)
- [ ] **"Planning Phase"**: Not ready for implementation (needs more planning)
- [ ] **"In Review"**: Code complete, undergoing testing (might need final steps)

**Readiness Scoring:**
- **High Ready (4/4)**: Ready for Development + All Dependencies Met + High Priority + Clear Technical Approach
- **Medium Ready (3/4)**: Most criteria met, minor gaps
- **Low Ready (2/4)**: Significant gaps in readiness
- **Not Ready (1/4)**: Major planning or dependency issues

### Step 4: Priority and Impact Analysis
**Consider strategic factors:**
- [ ] **Stated Priority**: High/Medium/Low as marked in the feature request
- [ ] **User Impact**: How many users will benefit?
- [ ] **Business Value**: Revenue, engagement, or growth impact
- [ ] **Technical Risk**: Implementation complexity and uncertainty
- [ ] **Timeline Pressure**: Immediate vs. short-term vs. long-term features

**Impact Assessment:**
- **High Impact**: Improves core user workflows, high business value, many users affected
- **Medium Impact**: Important improvements, moderate business value, specific user segments
- **Low Impact**: Nice-to-have features, minimal business impact, niche use cases

### Step 5: Technical Feasibility Assessment
**Evaluate implementation factors:**
- [ ] **Technical Complexity**: How difficult is the implementation?
- [ ] **Resource Requirements**: Time, expertise, external dependencies
- [ ] **Integration Challenges**: How well does it fit with existing architecture?
- [ ] **Testing Requirements**: What testing strategy is needed?
- [ ] **Deployment Considerations**: Any special deployment needs?

**Feasibility Scoring:**
- **High Feasibility**: Clear technical approach, reasonable complexity, good integration
- **Medium Feasibility**: Some technical challenges, moderate complexity
- **Low Feasibility**: Significant technical unknowns, high complexity, integration concerns

### Step 6: Strategic Recommendation
**Synthesize analysis into recommendation:**
- [ ] **Primary Recommendation**: The single best feature to work on next
- [ ] **Alternative Options**: 2-3 other viable candidates with trade-offs
- [ ] **Rationale**: Clear explanation of why this is the best choice
- [ ] **Prerequisites**: Any remaining blockers or preparation needed
- [ ] **Success Criteria**: How to measure successful completion

**Recommendation Format:**
```
## 🎯 Next Feature Recommendation

### Primary Recommendation: Feature Request #X - [Feature Name]
**Confidence Level:** High/Medium/Low
**Estimated Timeline:** [X weeks/months]
**Key Rationale:**
- Dependency Status: [All dependencies met/Clear path forward]
- Strategic Value: [High impact on user experience/business goals]
- Technical Feasibility: [Clear implementation path/reasonable complexity]
- Priority Alignment: [Matches immediate priorities/timeline goals]

### Implementation Readiness:
- [ ] Technical approach is clear and documented
- [ ] All dependencies are satisfied
- [ ] Resources and timeline are reasonable
- [ ] Success metrics are defined
- [ ] Testing strategy is planned

### Alternative Options:
1. **Feature Request #Y** - [Name]: [Brief rationale and trade-offs]
2. **Feature Request #Z** - [Name]: [Brief rationale and trade-offs]

### Next Steps:
1. [Immediate action needed]
2. [Preparation or validation required]
3. [Implementation approach]
```

## Step 7: Post-Selection Execution Preparation

**MANDATORY:** Once a feature is selected and approved for implementation, the YOU MUST consult the @claude-instructions/execution-primer.md for implementation guidance.

### Required Consultation Process:
- [ ] **Read execution-primer.md**: Review the complete implementation guidance document
- [ ] **Apply 99% confidence standard**: Ensure implementation approach meets the confidence threshold
- [ ] **Plan debug logging**: Prepare debug logging strategy if any uncertainty exists
- [ ] **Validate readiness**: Confirm all execution-primer requirements are met
- [ ] **Document preparation**: Record that execution-primer has been consulted

### Integration Point:
```
User selects feature → you consult @claude-instructions/execution-primer.md → Begin detailed analysis → Implementation
```

**Documentation Requirement:** When proceeding with implementation, the you must explicitly state:
> "I have consulted the @claude-instructions/execution-primer.md and am applying its guidance for this implementation. My confidence level is [X]% and [debug logging is/is not] required for this feature."

## Decision Framework

### When Multiple Features Are Equally Good:
**Tiebreaker Criteria (in order):**
1. **Dependency Unblocking**: Choose the feature that unblocks the most other features
2. **User Impact**: Prioritize features with higher user impact
3. **Business Value**: Consider revenue or growth implications
4. **Technical Risk**: Choose lower-risk implementations when uncertain
5. **Timeline Alignment**: Match immediate vs. short-term planning
6. **Feature ID**: Use lower ID numbers as final tiebreaker

### When No Features Are Ready:
**Guidance to provide:**
- [ ] "No features are currently ready for implementation"
- [ ] List the blocking factors for each feature
- [ ] Recommend specific actions to unblock features
- [ ] Suggest planning activities or dependency work
- [ ] Identify features closest to being ready

### When Planning is Needed:
**Recommend planning activities:**
- [ ] "Feature X needs more planning before implementation"
- [ ] List specific questions that need resolution
- [ ] Identify missing technical details or requirements
- [ ] Suggest research or design work needed
- [ ] Provide timeline for planning completion

## Analysis Quality Standards

### Required Analysis Quality:
- [ ] **Comprehensive**: All active feature requests considered
- [ ] **Data-Driven**: Decisions based on documented status, dependencies, and priorities
- [ ] **Context-Aware**: Considers recent completions and current development state
- [ ] **Strategic**: Balances immediate needs with long-term goals
- [ ] **Practical**: Recommendations are actionable and realistic
- [ ] **Traceable**: Clear rationale that can be verified against the source document

### Red Flags to Avoid:
- ❌ **Recommending blocked features**: Features with unmet dependencies
- ❌ **Ignoring status**: Recommending features still in planning phase
- ❌ **Missing context**: Not considering recent completions or current work
- ❌ **Vague rationale**: Recommendations without clear, verifiable reasoning
- ❌ **Single-factor decisions**: Choosing based only on priority without considering feasibility
- ❌ **Skipping execution-primer consultation**: Proceeding to implementation without consulting @claude-instructions/execution-primer.md

## Output Format

### Structured Analysis Report:
```markdown
# Next Feature Analysis Report

## 📊 Current State Analysis
**Active Feature Requests:** [Count]
**Recently Completed:** [List of recently completed features]
**In Development:** [Any features currently being worked on]
**Ready for Implementation:** [Count and brief list]

## 🔍 Dependency Analysis
**Unblocked Features:** [List of features with all dependencies met]
**Blocked Features:** [List of features waiting on dependencies]
**Partially Ready:** [Features with some dependencies met]

## 🎯 Recommendation
[Use the recommendation format from Step 6]

## 📋 All Options Considered
| Feature | Priority | Status | Dependencies | Feasibility | Recommendation |
|---------|----------|--------|--------------|-------------|----------------|
| FR #1   | High     | Ready  | ✅ Met       | High        | **Primary**    |
| FR #2   | Medium   | Ready  | ⏱️ Waiting   | Medium      | Alternative    |
| FR #3   | High     | Planning| N/A         | Low         | Not Ready      |

## 🚀 Next Steps
1. [Immediate action for recommended feature]
2. [Any preparation needed]
3. **MANDATORY: Consult execution-primer.md before implementation**
4. [How to begin implementation]
```

## Error Handling and Edge Cases

### Common Scenarios:
- **Empty Pipeline**: No features ready for implementation
- **Dependency Conflicts**: Circular dependencies or unclear requirements
- **Status Ambiguity**: Features with unclear or outdated status
- **Missing Information**: Incomplete feature requests or missing technical details
- **Timeline Conflicts**: Features needed urgently but not technically ready

### Response Strategies:
- **Be Transparent**: Clearly state when information is missing or unclear
- **Provide Options**: Give alternatives and trade-offs when primary recommendation isn't clear
- **Suggest Actions**: Recommend specific steps to resolve blockers or ambiguities
- **Escalate Complex Cases**: When analysis reveals systemic issues with the feature pipeline

## Integration with Development Workflow

### Pre-Implementation Phase:
- Use this analysis before starting any new feature work
- Validate that the chosen feature is truly ready for implementation
- Ensure all planning and dependencies are properly resolved

### Post-Selection Phase (NEW - MANDATORY):
- **IMMEDIATELY after feature selection**: you must consult @claude-instructions/execution-primer.md
- **Before detailed analysis**: Apply 99% confidence standard and debug logging requirements
- **Document consultation**: Explicitly state @claude-instructions/execution-primer.md guidance has been applied
- **Validate implementation readiness**: Confirm all @claude-instructions/execution-primer.md requirements are met

### Post-Completion Phase:
- Run this analysis after completing features to see what gets unblocked
- Update the development priorities based on new opportunities
- Maintain momentum by quickly identifying the next valuable work

### Planning Phase Integration:
- Use analysis results to inform feature planning priorities
- Identify features that need more planning work
- Help prioritize dependency resolution work

## Success Metrics

### Analysis Quality Metrics:
- **Accuracy**: Recommendations lead to successful implementations
- **Completeness**: All relevant factors considered in decision
- **Clarity**: Rationale is clear and well-documented
- **Timeliness**: Analysis completed efficiently without over-analysis
- **Actionability**: Recommendations translate to immediate next steps

### Feature Success Tracking:
- Track which recommended features complete successfully
- Monitor if dependency analysis was accurate
- Measure time from recommendation to implementation start
- Validate that priority assessments matched actual value delivered

Remember: The goal is to provide intelligent, data-driven feature recommendations that accelerate development while maintaining quality and strategic alignment. Focus on actionable insights that help the developer make confident decisions about what to work on next. 