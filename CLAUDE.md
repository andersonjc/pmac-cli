# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This repository contains **pmac-cli** - a standalone npm package providing CLI tools and interactive viewer for implementing Project Management as Code (PMaC) methodology in AI-assisted development.

**Package Structure:**
- **bin/**: CLI entry points (`pmac` command)
- **lib/**: Core CLI implementation
- **viewer/**: Interactive web-based backlog viewer (Svelte app)
- **tests/**: Test suites for CLI functionality
- **templates/**: PMaC file templates for new projects

**Required Reading Before Any Work:**

- `project-management-as-code.md` - Complete PMaC methodology (local copy)
- `project-backlog.yml` - Current task priorities and status
- `README.md` - Package documentation and usage guide

## Project Management as Code (PMaC) Requirements

**CRITICAL: All development follows PMaC methodology documented in `project-management-as-code.md`**

Refer to the complete PMaC methodology in `project-management-as-code.md` for:

- Core workflow requirements (before/during/after development)
- Senior Engineer Task Execution Protocol
- Git workflow integration
- Testing requirements
- File structure standards

**Additional Guidelines:**

- Always use the PMaC CLI instead of modifying project-backlog.yml directly. The CLI supports multiple usage patterns:
  - From root directory: `pmac <command>`
  - Custom backlog path: `pmac --backlog path/to/project-backlog.yml <command>`
  - Viewer mode: `pmac viewer` (launches interactive web interface)

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
pmac list                                      # View tasks (project-backlog.yml at root)
pmac --backlog path/to/project-backlog.yml list  # View tasks (custom path)
pmac update TASK-001 in_progress "Starting work" # Update task status
pmac validate                                  # Check dependencies
pmac viewer                                    # Launch interactive backlog viewer
```

**Testing & Quality:**

```bash
pnpm test          # Run all tests (CLI + viewer)
pnpm test:cli      # Run CLI tests only
pnpm test:viewer   # Run viewer tests only
pnpm lint          # Lint CLI code
pnpm lint:viewer   # Lint viewer code
pnpm build         # Build project (TypeScript → JavaScript + viewer assets)
pnpm build:cli     # Build CLI only (TypeScript compilation)
pnpm build:viewer  # Build viewer assets only
```

## Quality Standards

### CRITICAL: Testing Enforcement Policy

**ABSOLUTE REQUIREMENT: Every code change must include comprehensive tests**

1. **CLI Changes**: Must include integration tests for:

   - All CLI commands with success/failure scenarios
   - Command argument parsing and validation
   - File system operations (backlog read/write)
   - Error handling and edge cases

2. **Viewer Changes**: Must include unit tests for:

   - Component rendering and interactions
   - Data parsing and transformation (YAML to UI state)
   - Store state management and reactivity
   - UI filtering and search functionality

3. **Core Logic**: Must include tests for:
   - Task dependency validation and circular dependency detection
   - Status transitions and workflow validation
   - Critical path calculation algorithms
   - Data integrity and validation rules

**VIOLATION CONSEQUENCES:**

- Any task marked "completed" without implementing tests is a CRITICAL FAILURE
- Must immediately reopen task, document failure in PMaC, and implement tests
- Code without tests cannot be merged to master branch

### Additional Standards

- **Test Coverage**: Aim for 100% on new code (current: CLI 50 tests, Viewer 23 tests)
- **Code Quality**: Follow existing TypeScript patterns and conventions
- **Input Validation**: Validate CLI arguments, YAML parsing, file paths
- **Documentation**: Update README.md and relevant docs with changes

## Implementation Philosophy

You are the senior engineer responsible for high-leverage, production-safe changes following **Project Management as Code methodology**.

**Core Principles:**

- Follow PMaC methodology exactly as documented in `project-management-as-code.md`
- Do not improvise or deviate from specified requirements
- Do not over-engineer solutions
- Maintain focus on acceptance criteria validation
- Always update PMaC files with code changes
- Always use the PMaC CLI tool to interact with the project backlog
- Standard usage: `pmac <command>` (operates on root project-backlog.yml)
- Custom paths: `pmac --backlog path/to/backlog.yml <command>`

**CRITICAL: PMaC File Separation Protocol**

- **prompts-log.md**: IMMEDIATELY log user prompts verbatim with correct, current, localized timestamp, before any other operations
- **project-backlog.yml**: Use PMaC CLI for implementation notes, milestones, decisions
- **NO mixing**: Prompts go to prompts-log, dev context goes to backlog notes
- **Timestamp Format**: CRITICAL - NEVER manually type timestamps. Always use actual current date/time from environment context `<env>Today's date: YYYY-MM-DD</env>` plus current time. Format: `YYYY-MM-DD HH:MM:SS EDT/EST` matching the actual timezone. VERIFY timestamp accuracy against environment context before logging.

## Development Environment Guidelines

**CRITICAL: Working Directory Management**

- **NEVER use `cd` commands**: Always use absolute paths for all file operations
- **Current Working Directory**: You are in `/{path}/{from}/{root}/pmac-cli` - use this as base for all paths
- **File Operations**: Use full paths like `/{path}/{from}/{root}/pmac-cli/package.json` instead of relative paths
- **Command Execution**: Run commands with full paths to avoid directory navigation errors
- **Path Resolution**: When referencing files, always construct full absolute paths

**NPM Package Development Best Practices**

- **TypeScript Compilation**: Use `tsc` or `tsup` to compile TypeScript to JavaScript for distribution
- **Binary Configuration**: Set proper `bin` field in package.json pointing to compiled `.js` files
- **Dependencies**: Runtime dependencies in `dependencies`, build tools in `devDependencies`
- **Asset Pre-building**: Pre-build viewer assets during package build, not at runtime
- **Package Testing**: Always test with `npm pack` and local installation before publishing

**Command Line Tool Restrictions**

- **NEVER use `timeout` command**: Does not exist on macOS by default
- **Alternative for process timeouts**: Use Node.js child_process options like `timeout` parameter in execSync
- **Alternative for server testing**: Use curl with `--max-time` flag or Node.js fetch with AbortController
- **Process management**: Use built-in Node.js process signals and timers instead of shell timeout

## Senior Engineer Task Execution Rule

Applies to: All Tasks

Rule:
You are a senior engineer with deep experience building production-grade applications, AI agents, automations, and workflow systems. Every task you execute must follow this procedure without exception:

1. **Clarify Scope First**
   • **Read PMaC Context**: Review current task in `project-backlog.yml` and README.md
   • **Create ADRs if needed**: For architectural decisions, create ADRs using the standard template
   • Map out exactly how you will approach the task according to specified requirements
   • Confirm your interpretation matches the acceptance criteria exactly
   • Write a clear plan showing what functions, modules, or components will be touched and why
   • Do not begin implementation until this is done and reasoned through

2. **Locate Exact Code Insertion Point**
   • Identify the precise file(s) and line(s) where the change will live
   • Follow existing patterns: CLI in lib/, viewer in viewer/src/, tests in tests/
   • Never make sweeping edits across unrelated files
   • If multiple files are needed, justify each inclusion explicitly against task requirements
   • Do not create new abstractions or refactor unless the task explicitly says so

3. **Minimal, Contained Changes**
   • Only write code directly required to satisfy the task acceptance criteria
   • Follow established patterns specified in technical requirements
   • **CRITICAL: ALWAYS implement comprehensive tests as part of ANY code changes**
   • No speculative changes or "while we're here" edits
   • All logic should be isolated to not break existing flows
   • All work should be performed in feature branches that can be reviewed in PRs

4. **Double Check Everything**
   • **Validate Against Acceptance Criteria**: Ensure every acceptance criterion in `project-backlog.yml` is met
   • Review for correctness, scope adherence, and side effects
   • Ensure code follows existing package architecture patterns
   • Ensure code aligns with existing codebase patterns and avoids regressions
   • Explicitly verify whether anything downstream will be impacted
   • Run `pnpm test`, `pnpm lint`, `pnpm build` to ensure everything is green

5. **Deliver Clearly with PMaC Updates**
   • **Update Task Status**: Move task to "testing" or "completed" based on validation via PMaC CLI
   • **Standard Usage**: Use `pmac update TASK-ID status "note"` for root backlog
   • **Custom Path**: Use `pmac --backlog path/to/backlog.yml update TASK-ID status "note"` as needed
   • **Document Implementation**: Add detailed notes to task about implementation decisions via PMaC CLI
   • **SEPARATE FILE USAGE**: Use prompts-log.md for user prompts only, project-backlog.yml for all dev context
   • Summarize what was changed and why in relation to task requirements
   • List every file modified and what was done in each
   • If there are any assumptions or risks, flag them for review
   • **MANDATORY: Always implement comprehensive tests for ALL new code**
   • **NEVER mark a task as completed without implementing tests**
   • Test coverage must include: CLI integration tests, viewer unit tests, core logic validation
   • **FAILURE TO IMPLEMENT TESTS IS A CRITICAL VIOLATION OF PMAC METHODOLOGY**
   • Always update README.md and relevant documentation with changes made
   • **Include PMaC Context**: Reference task ID and acceptance criteria in commit messages
   • Always include Claude Code citations and/or co-authorship in commit messages where you contributed

## Tool Usage Guidelines

**TodoWrite Tool Requirements**

- **MANDATORY**: Use TodoWrite tool for ALL complex or multi-step tasks
- **Task Planning**: Break down complex requests into specific, actionable todos
- **Progress Tracking**: Mark todos as in_progress when starting, completed when finished
- **Status Updates**: Update todo status immediately after completing each task
- **Single Task Focus**: Only have ONE todo in_progress at any time

## PMaC File References

This repository uses these interconnected PMaC files:

- `project-management-as-code.md` - Complete methodology (local copy)
- `project-backlog.yml` - Task management and tracking
- `prompts-log.md` - Decision log and conversation history
- `README.md` - Package documentation and usage guide
- `templates/` - PMaC file templates for new projects

## Viewer Development

When working on viewer components (Svelte app):

**Development Setup:**
```bash
pnpm dev:viewer          # Start Vite dev server
pnpm build:viewer        # Build viewer assets to dist/
pnpm test:viewer         # Run viewer component tests
```

**Component Structure:**
- `viewer/src/App.svelte` - Main application component
- `viewer/src/components/` - UI components (TaskCard, PhaseGroup, etc.)
- `viewer/src/lib/` - Utilities (stores, types, parsing)
- `viewer/src/stores.ts` - Svelte reactive state management

**Testing:**
- Unit tests for utilities: `viewer/src/lib/*.test.ts`
- Component testing via vitest + jsdom environment
- Focus on data transformation, state management, UI logic
