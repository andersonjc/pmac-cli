# [Your Project Name] Development - Prompts Log

## Project Management as Code (PMaC) Implementation

_Complete conversation history for AI-assisted development of [Your Project Name]_

---

**PMaC Methodology**: This file implements the decision tracking component of Project Management as Code as documented in `project-management-as-code.md`

**Related Files**:

- `project-management-as-code.md` - Complete PMaC methodology documentation
- `[your-project]-requirements.md` - Technical requirements and architecture specifications
- `project-backlog.yml` - Task management and progress tracking
- `CLAUDE.md` - AI assistant instructions ensuring PMaC compliance

**Purpose**: Maintain complete audit trail of all development decisions, technical discussions, and requirement evolution throughout the project lifecycle.

---

## Project Metadata

- **Project**: [Your Project Name]
- **Version**: [Version Number]
- **Started**: [YYYY-MM-DD]
- **PMaC Implementation**: Full methodology as specified in `project-management-as-code.md`
- **AI Assistant**: Claude Code following standards in `CLAUDE.md`

---

## Prompt Log Entries

### Entry Format

Each entry should follow this structure:

- **Date/Time**: ISO format timestamp
- **Task Reference**: Related task ID from `project-backlog.yml` (if applicable)
- **Prompt Type**: [REQUIREMENT] | [DECISION] | [IMPLEMENTATION] | [QUESTION] | [CLARIFICATION]
- **Context**: Brief description of what prompted this entry
- **Content**: Complete prompt or decision details
- **Outcome**: Result, decision made, or action taken
- **Files Modified**: List of files changed as result of this prompt

---

### [YYYY-MM-DD HH:MM:SS TZ] - Project Initialization

**Task Reference**: PMAC-001  
**Prompt Type**: [REQUIREMENT]  
**Context**: Initial project setup and PMaC methodology implementation

**Content**:

```
[Example initial prompt]
Read the PMaC methodology and project requirements. Let me know when you're up to speed by summarizing what we are about to do.
```

**Outcome**: [Document the AI's understanding and any clarifications needed]

**Files Modified**:

- None (documentation review only)

---

### [YYYY-MM-DD HH:MM:SS TZ] - [Example Entry Title]

**Task Reference**: [TASK-ID]  
**Prompt Type**: [PROMPT-TYPE]  
**Context**: [Brief context description]

**Content**:

```
[Complete prompt text exactly as given to AI]
```

**Outcome**: [What was decided, implemented, or clarified]

**Files Modified**:

- `[filename]` ([what was changed])
- `[filename]` ([what was changed])

---

## Development Decision Categories

### Architecture Decisions

_Fundamental technical architecture choices and their rationale_

### Product Requirements Evolution

_Changes to product requirements and user stories_

### Implementation Approach

_Technical implementation decisions and alternatives considered_

### Integration Decisions

_Third-party service integrations and API design choices_

### Performance & Scalability

_Decisions related to performance optimization and scalability planning_

### Security & Privacy

_Security implementations and privacy-first design decisions_

### Testing Strategy

_Testing approach decisions and quality assurance methodology_

---

## Quick Reference

### Current Sprint

- **Phase**: [Current phase from project-backlog.yml]
- **Active Tasks**: [List of in_progress tasks]
- **Next Priorities**: [List of ready tasks]

### Key Architecture Decisions Made

_This section will be populated as decisions are made and logged_

### Outstanding Questions

_Questions that need resolution before proceeding with specific tasks_

### Technical Debt & Future Considerations

_Technical debt introduced and future refactoring considerations_

---

## PMaC Compliance Notes

- ✅ Cross-references all PMaC files by filename
- ✅ Maintains complete audit trail of development decisions
- ✅ Links prompts to specific tasks in `project-backlog.yml`
- ✅ Documents rationale for all architectural choices
- ✅ Provides searchable history of requirement evolution
- ✅ Enables new team members to understand project evolution
- ✅ Supports AI assistant continuity across development sessions

---

_This log implements the "Complete conversation history" requirement of PMaC methodology, ensuring all development decisions are preserved and traceable through version control alongside the code they influenced._

<!-- Template Usage Instructions:
1. Replace [bracketed placeholders] with your project-specific information
2. Update project metadata section with actual project details
3. Log every interaction with AI assistants using the entry format
4. Always include complete prompt text, not summaries
5. Document outcomes and decisions made as a result of each prompt
6. List all files modified as a result of each interaction
7. Use consistent task references that match project-backlog.yml
8. Categorize decisions in the appropriate sections for easy reference
9. Update Quick Reference section regularly as project progresses
10. Remove these template usage instructions when starting actual logging
11. Maintain chronological order of all entries
12. Include timezone in all timestamps for clarity
-->