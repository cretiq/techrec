#!/bin/bash

# Claude Code Memory Optimization Script
# Generates hourly, daily, and weekly custom commands for optimal Claude performance

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Create commands directory if it doesn't exist
mkdir -p commands

print_header "Generating Claude Code memory optimization commands..."

# HOURLY: Session optimization with memory analysis
cat > commands/hourly-sync.md << 'EOF'
Perform hourly session optimization and memory sync:

## Context Analysis & Memory Update
Think hard about analyzing current project state and updating memory:

### 1. PROJECT STATE ANALYSIS
- **Recent Changes**: Analyze git log, recent commits, and modified files since last session
- **Current Context**: Understand active branch, pending work, and immediate priorities
- **Codebase Evolution**: Identify new patterns, architectural changes, or dependency updates
- **Development Focus**: Recognize current feature work, bug fixes, or refactoring efforts

### 2. PATTERN RECOGNITION
- **Effective Collaboration**: What prompting styles and workflows worked well this session?
- **Quality Patterns**: Which coding approaches and standards proved most effective?
- **Problem-Solving Success**: What debugging or development strategies were particularly useful?
- **Tool Usage**: Which commands, shortcuts, or integrations enhanced productivity?

### 3. MEMORY OPTIMIZATION
Based on analysis, update .claude/CLAUDE.md with:
- **New Conventions**: Any coding standards or patterns that emerged
- **Architectural Insights**: Design decisions, patterns, or structural understanding
- **Workflow Improvements**: Effective development processes or collaboration methods
- **Context Enhancements**: Project-specific knowledge that improves future assistance

### 4. PREPARATION FOR CONTINUATION
- **Current State Summary**: Document where we are and what's actively being worked on
- **Next Session Setup**: Prepare context for seamless continuation
- **Priority Identification**: Note urgent items or blockers for immediate attention
- **Context Preservation**: Ensure all relevant information is captured for future sessions

Update our memory with actionable insights that will make future collaboration more effective. Focus on patterns, preferences, and project-specific knowledge that enhance development speed and quality.
EOF

# DAILY: Comprehensive analysis and memory refinement
cat > commands/daily-memory-sync.md << 'EOF'
Perform comprehensive daily memory analysis and optimization:

## Deep Project Analysis
Think ultrahard about today's development patterns and insights:

### 1. COMPREHENSIVE CHANGE ANALYSIS
- **Git History Deep Dive**: Review all commits from today, analyzing patterns, quality, and evolution
- **Codebase Understanding**: Identify architectural changes, new components, or structural improvements
- **Dependency Evolution**: Note new libraries, version updates, or integration changes
- **Documentation Updates**: Recognize changes in README, comments, or project documentation

### 2. DEVELOPMENT PATTERN RECOGNITION
- **Coding Style Evolution**: Identify emerging preferences, naming conventions, or structural patterns
- **Quality Standards Refinement**: Recognize successful approaches to testing, error handling, or validation
- **Architectural Decision Tracking**: Document significant design choices and their rationale
- **Performance Considerations**: Note optimization strategies or performance-related decisions

### 3. COLLABORATION EFFECTIVENESS ANALYSIS
- **Communication Patterns**: Which prompt styles, context sharing, and interaction methods worked best?
- **Problem-Solving Efficiency**: What approaches to debugging, planning, and implementation were most effective?
- **Learning Integration**: How well did we incorporate new knowledge or techniques?
- **Workflow Optimization**: Which development processes or tool usage patterns enhanced productivity?

### 4. STRATEGIC MEMORY UPDATES
Update .claude/CLAUDE.md with refined understanding:

#### Project Context Enhancement
- **Technology Stack Details**: Updated understanding of frameworks, tools, and their usage patterns
- **Architecture Documentation**: Refined knowledge of system design, data flow, and component relationships
- **Development Environment**: Enhanced understanding of build processes, testing setup, and deployment workflow
- **Team Conventions**: Updated coding standards, review processes, and collaboration patterns

#### AI Collaboration Optimization
- **Effective Prompting Patterns**: Document successful communication strategies and context-sharing methods
- **Development Workflow Integration**: Refine understanding of how AI assistance fits into development process
- **Quality Assurance Approach**: Enhanced strategies for code review, testing, and validation
- **Learning and Adaptation**: Improved methods for incorporating new knowledge and techniques

### 5. FORWARD-LOOKING PREPARATION
- **Tomorrow's Context**: Set up optimal starting conditions for next development session
- **Priority Clarification**: Ensure clear understanding of upcoming tasks and constraints
- **Potential Challenges**: Identify areas that may need special attention or planning
- **Continuous Improvement**: Note opportunities for enhancing development processes or AI collaboration

Generate specific, actionable memory updates that will significantly improve future development sessions. Focus on patterns that compound over time to create exceptional AI-assisted development.
EOF

# WEEKLY: Strategic analysis and memory optimization
cat > commands/weekly-memory-optimization.md << 'EOF'
Perform comprehensive weekly strategic memory optimization:

## Strategic Development Analysis
Think at the highest level about this week's development evolution:

### 1. COMPREHENSIVE PROJECT EVOLUTION ANALYSIS
- **Architectural Maturation**: How has the system architecture evolved and what new patterns have emerged?
- **Technology Integration**: What new tools, libraries, or techniques have been successfully adopted?
- **Quality Standards Evolution**: How have our coding standards, testing approaches, and review processes improved?
- **Development Velocity**: What factors have enhanced or hindered development speed and effectiveness?

### 2. DEEP PATTERN MINING
- **Coding Convention Crystallization**: Which coding patterns, naming conventions, and structural approaches have proven most effective?
- **Problem-Solving Methodology**: What debugging, planning, and implementation strategies consistently produce the best outcomes?
- **Collaboration Intelligence**: Which AI interaction patterns, prompting strategies, and workflow integrations are most productive?
- **Learning Acceleration**: How effectively are we incorporating new knowledge and adapting to changing requirements?

### 3. FRAMEWORK AND CONVENTION ANALYSIS
- **Development Framework Maturation**: How have our development processes, workflows, and standards evolved?
- **Decision-Making Patterns**: What architectural and technical decision-making approaches have proven most effective?
- **Quality Assurance Framework**: How have our testing, review, and validation processes improved?
- **Integration Strategies**: What patterns for incorporating new technologies or refactoring existing code work best?

### 4. COMPREHENSIVE MEMORY SYSTEM OVERHAUL
Based on week's insights, strategically update .claude/CLAUDE.md:

#### Core Development Philosophy Refinement
- **Quality vs. Speed Balance**: Refined understanding of when to prioritize quality vs. delivery speed
- **Learning and Adaptation Strategy**: Enhanced approach to incorporating new technologies and techniques
- **Problem-Solving Methodology**: Crystallized debugging, planning, and implementation strategies
- **Collaboration Framework**: Optimized patterns for AI-assisted development and team integration

#### Technical Excellence Framework
- **Architectural Decision Framework**: Document proven approaches to system design and technical choices
- **Code Quality Standards**: Refined coding conventions, patterns, and quality assurance methods
- **Performance and Security Mindset**: Enhanced understanding of optimization and security considerations
- **Maintainability Strategy**: Proven approaches to writing sustainable, evolvable code

#### AI Collaboration Mastery
- **Context Intelligence**: Optimal methods for sharing project context and maintaining development continuity
- **Prompting Excellence**: Most effective communication patterns, instruction styles, and collaboration approaches
- **Workflow Integration**: Seamless integration of AI assistance into development processes
- **Continuous Learning**: Strategies for evolving AI collaboration effectiveness over time

### 5. STRATEGIC OPTIMIZATION PLANNING
- **Development Velocity Enhancement**: Identify opportunities to further improve development speed and quality
- **Skill Development Targeting**: Focus areas for learning and capability enhancement
- **Process Optimization**: Refine development workflows and AI collaboration patterns
- **Quality Improvement**: Strategies for maintaining and enhancing code quality and system reliability

### 6. MEMORY VALIDATION AND TESTING
- **Effectiveness Verification**: Test updated memory against real development scenarios
- **Pattern Validation**: Ensure documented patterns actually improve development outcomes
- **Continuous Refinement**: Plan for ongoing memory optimization based on results
- **Knowledge Gaps Identification**: Recognize areas where memory needs enhancement or clarification

Generate a comprehensive memory optimization that creates compound improvements in development effectiveness. Focus on frameworks, conventions, and patterns that will make every future session more productive and higher quality.

The goal is creating an AI development partner that understands your project, preferences, and patterns so deeply that collaboration becomes effortless and highly effective.
EOF

print_status "Generated memory optimization commands:"
echo "  ⏰ Hourly: hourly-sync.md"
echo "  📅 Daily: daily-memory-sync.md" 
echo "  📊 Weekly: weekly-memory-optimization.md"
echo
print_header "Usage:"
echo "Run in Claude Code with:"
echo "  /project:hourly-sync"
echo "  /project:daily-memory-sync"
echo "  /project:weekly-memory-optimization"
echo
print_status "Memory optimization system ready! 🧠"
