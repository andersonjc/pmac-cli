# AI Assistant Instructions (CLAUDE.md)

This repository follows **Project Management as Code (PMaC)** methodology for AI-assisted development.

## Required Reading Before Any Work

1. **`project-management-as-code.md`** - Complete PMaC methodology and workflow
2. **`project-backlog.yml`** - Current task priorities and status  
3. **`project-requirements.md`** - Technical requirements and architecture

## Core PMaC Requirements

**CRITICAL: All development must follow PMaC methodology exactly as documented.**

### Before Starting Work
- Read current task from `project-backlog.yml` (status: "ready", highest priority)
- Update task status to "in_progress" when beginning
- Follow exact requirements and acceptance criteria as specified

### During Development  
- Update task notes with implementation decisions in `project-backlog.yml`
- Log all prompts and decisions in `prompts-log.md`
- Follow technical requirements exactly - no improvisation

### Before Committing
- Validate ALL acceptance criteria are met
- Update task status ("testing" → "completed" when validated)  
- Commit PMaC files with every code change
- Include task ID in commit messages: "TASK-ID: Description"

## Development Commands

**PMaC Management:**
```bash
pnpm pmac list              # View current tasks
pnpm pmac update TASK-001 in_progress "Starting work"
pnpm pmac validate          # Check dependencies
```

**Testing & Quality:**
```bash
pnpm test                       # Run all tests
pnpm lint                   # Run linting  
pnpm build                  # Build project
```

## Quality Standards

- **Test Coverage**: Aim for 100% on new code
- **Code Quality**: Follow existing patterns and conventions
- **Security**: Validate inputs, secure auth patterns, audit logs
- **Documentation**: Update relevant docs with changes

### Senior Engineer Task Execution Protocol

Every task must follow this 5-step protocol:

#### 1. 📋 Clarify Scope
- Review task in `project-backlog.yml` + technical requirements
- Confirm interpretation matches acceptance criteria exactly
- Plan what files/components will be modified and why

#### 2. 🎯 Locate Insertion Points  
- Identify precise files and lines for changes
- Follow architecture patterns from technical requirements
- Justify each file modification against task requirements

#### 3. ⚡ Minimal Changes
- Write only code required for acceptance criteria
- Follow existing patterns and frameworks
- No speculative changes or refactoring unless specified

#### 4. ✅ Validate Everything
- Check every acceptance criterion is met
- Run tests, lint, build - ensure all pass
- Verify no regressions or downstream impacts

#### 5. 📝 Update & Document
- Move task status to "completed" when validated
- Add implementation notes to task
- Update both `project-backlog.yml` and `prompts-log.md`
- Include task ID in commit messages

## PMaC File References

This repository uses these interconnected PMaC files:
- `project-management-as-code.md` - Complete methodology
- `project-backlog.yml` - Task management and tracking
- `prompts-log.md` - Decision log and conversation history  
- `project-requirements.md` - Technical architecture and specs
