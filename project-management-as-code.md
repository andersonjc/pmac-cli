# Project Management as Code (PMaC)

A file-based methodology for AI-assisted software development.

## The Problem

Traditional PM tools (Jira, Linear, Asana) don't integrate with AI assistants. Context gets lost, decisions aren't tracked, and there's no standard way to maintain project continuity when working with AI.

## The Solution

Version-controlled files that provide complete project context to both humans and AI assistants.

## Core Files

| File | Purpose |
|------|---------|
| **`project-backlog.yml`** | Tasks, dependencies, status tracking, acceptance criteria |
| **`prompts-log.md`** | Complete conversation history and decision audit trail |
| **`project-requirements.md`** | Technical architecture and specifications |
| **`CLAUDE.md`** | AI assistant instructions and project guidance |

## Key Benefits

- **🤖 AI-Native**: YAML/Markdown format AI assistants can read and update
- **📝 Complete Audit Trail**: Every decision tracked in version control  
- **⚡ Zero Context Loss**: Resume complex projects with full context
- **🔄 Git Integration**: PM data evolves alongside code
- **🏗️ Quality Assurance**: Built-in protocols ensure production-ready code

## Workflow

### Before Starting Work
1. Read next "ready" task from `project-backlog.yml` (highest priority)
2. Update task status to "in_progress"
3. Review requirements and acceptance criteria

### During Development
1. Update task notes with implementation decisions
2. Log all AI prompts in `prompts-log.md`
3. Follow technical requirements exactly

### Before Committing
1. Validate ALL acceptance criteria are met
2. Update task status to "completed"
3. Commit PMaC files with code changes
4. Include task ID in commit message

## Git Integration

```bash
# Feature branches
git checkout -b feature/TASK-001-description

# Commit with task ID
git commit -m "TASK-001: Implement feature XYZ

✅ All acceptance criteria met
📝 Updated PMaC files"

# PR titles reference tasks
"TASK-001: Implementation of JWT authentication"
```

## File Structure

```
project-root/
├── project-management-as-code.md    # This methodology
├── project-backlog.yml               # Task management  
├── prompts-log.md                    # Decision log
├── project-requirements.md           # Technical specs
├── CLAUDE.md                         # AI instructions
├── tools/pmac.ts                     # CLI tool (optional)
└── src/                             # Application code
```

## Quality Standards

- **Tests**: 100% coverage on new code, all tests pass
- **Dependencies**: Validate with `npm run pmac validate`
- **Documentation**: Update with all code changes
- **Security**: Input validation, secure patterns, audit logs

## Task Structure Example

```yaml
# project-backlog.yml
phases:
  development:
    tasks:
      - id: AUTH-001
        title: "Implement JWT Authentication"
        status: "ready"
        priority: "high"
        estimated_hours: 8
        requirements:
          - "Create JWT token generation endpoint"
          - "Implement token validation middleware"
        acceptance_criteria:
          - "✅ Users can login and receive valid tokens"
          - "✅ Protected routes validate tokens correctly"
          - "✅ All tests pass with >95% coverage"
        dependencies: ["SETUP-001"]
```

## PMaC vs Traditional PM

| Aspect | Traditional Tools | PMaC |
|--------|------------------|------|
| AI Integration | Manual/None | Native |
| Decision Context | Lost | Complete |
| Version Control | External | Full Integration |
| Audit Trail | Platform-dependent | Git + prompts + tasks |
| Quality Control | External processes | Built-in protocols |

## PMaC CLI Tool

Optional TypeScript CLI for enhanced workflows:

```bash
# Installation
npm install -D yaml tsx @types/node

# Key Commands
npm run pmac list [status] [priority]    # List filtered tasks
npm run pmac update TASK-001 in_progress # Update status
npm run pmac validate                     # Check dependencies
npm run pmac critical-path                # Show critical path
```

## Getting Started

1. **Initialize Files**: Copy PMaC templates to your project root
2. **Install CLI**: `npm install -D yaml tsx @types/node` 
3. **Configure**: Add `"pmac": "tsx tools/pmac.ts"` to package.json scripts
4. **Start Working**: Pick tasks from `project-backlog.yml` and follow workflow

## Best Practices

**Task Definition:**
- Write specific, testable acceptance criteria
- Include testing requirements  
- Reference technical requirements
- Estimate effort realistically

**Documentation:**
- Log every AI prompt in `prompts-log.md`
- Document architectural decisions
- Update PMaC files with code changes
- Use task IDs in commits and branches

**Quality:**
- Follow Senior Engineer Protocol for every task
- Validate all criteria before marking complete
- Run tests, lint, build before committing
- Maintain 100% test coverage on new code

## Common Pitfalls

- **Skipping PMaC updates** → Use Git hooks to enforce
- **Vague criteria** → Write specific, measurable outcomes  
- **Incomplete logging** → Log every interaction verbatim
- **Poor dependencies** → Use CLI validation to prevent cycles

---

**License**: MIT - Encouraging adoption and contribution to AI-assisted development standards.
