# PMaC CLI - Project Management as Code Command Line Interface

A comprehensive TypeScript CLI tool for managing Project Management as Code (PMaC) workflows. This tool enables efficient task management, dependency tracking, and project organization through a YAML-based backlog system.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Command Reference](#command-reference)
- [Advanced Usage](#advanced-usage)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [PMaC Methodology](#pmac-methodology)

## Overview

The PMaC CLI provides a command-line interface for managing project backlogs using the Project Management as Code methodology. It operates on YAML files that define project phases, tasks, dependencies, and progress tracking.

### Key Features

- **Task Management**: Create, update, and track tasks across project phases
- **Dependency Management**: Add/remove dependencies with circular dependency detection
- **Priority Management**: Update task priorities and organize by importance
- **Phase Organization**: Move tasks between project phases
- **Validation**: Comprehensive dependency and relationship validation
- **Audit Trail**: Automatic local timezone timestamps for all notes and changes
- **Critical Path Analysis**: Identify project bottlenecks and timeline impacts

### Architecture

The CLI operates on a standardized YAML structure:

```yaml
metadata:
  project: "Project Name"
  version: "1.0.0"

phases:
  phase_name:
    title: "Phase Title"
    description: "Phase description"
    status: "ready"
    estimated_duration: "2 weeks"
    tasks:
      - id: "TASK-001"
        title: "Task Title"
        status: "ready"  # ready|in_progress|testing|completed
        priority: "high"  # critical|high|medium|low
        estimated_hours: 8
        dependencies: ["OTHER-TASK"]
        blocks: ["FUTURE-TASK"]
        notes: []
```

## Installation

### Prerequisites

- Node.js 18+ 
- pnpm package manager (npm/yarn also supported)
- TypeScript runtime (tsx)

### Setup

1. **Install Dependencies**
   ```bash
   pnpm add -D yaml tsx @types/node
   # or
   npm install -D yaml tsx @types/node
   ```

2. **Copy CLI Files**
   ```bash
   # Copy these files to your project's tools/ directory:
   # - pmac.ts (main CLI implementation)
   # - pmac.test.ts (test suite)
   # - vitest.config.ts (test configuration)
   # - PMAC_CLI_README.md (this documentation)
   ```

3. **Add NPM Script**
   ```json
   {
     "scripts": {
       "pmac": "tsx tools/pmac.ts"
     }
   }
   ```

4. **Verify Installation**
   ```bash
   pnpm pmac help
   # or
   npm run pmac help
   ```

## Quick Start

### Initialize Project Backlog

Create a `project-backlog.yml` file in your project root:

```yaml
metadata:
  project: "My Project"
  version: "1.0.0"

phases:
  foundation:
    title: "Foundation Phase"
    description: "Initial setup and infrastructure"
    status: "ready"
    estimated_duration: "2 weeks"
    tasks: []
```

### Basic Commands

```bash
# List all tasks
pnpm pmac list

# Create a new task
pnpm pmac create TASK-001 "Setup development environment" foundation high 8

# Update task status
pnpm pmac update TASK-001 in_progress "Starting development setup"

# Add a dependency
pnpm pmac add-dep TASK-002 TASK-001

# View critical path
pnpm pmac critical-path

# Validate all dependencies
pnpm pmac validate
```

## Command Reference

### Task Management Commands

#### `list [status] [priority]`
List all tasks with optional filtering.

```bash
# List all tasks
pnpm pmac list

# List only in-progress tasks
pnpm pmac list in_progress

# List high-priority ready tasks
pnpm pmac list ready high
```

**Filters:**
- `status`: ready, in_progress, testing, completed
- `priority`: critical, high, medium, low

#### `create <taskId> <title> <phase> [priority] [estimatedHours]`
Create a new task in the specified phase.

```bash
# Basic task creation
pnpm pmac create FEAT-001 "New feature implementation" development

# Task with priority and hours
pnpm pmac create FEAT-002 "User authentication" backend high 12
```

**Parameters:**
- `taskId`: Unique identifier (required)
- `title`: Task description (required)
- `phase`: Target phase name (required)
- `priority`: critical|high|medium|low (default: medium)
- `estimatedHours`: Numeric value (default: 8)

#### `update <taskId> <status> [note]`
Update task status with optional note. Timestamps are automatically added to notes.

```bash
# Update status only
pnpm pmac update FEAT-001 in_progress

# Update with note (timestamp automatically added)
pnpm pmac update FEAT-001 testing "Ready for QA review"
# Results in: "2025-06-23 11:45:30 a.m. EDT: Ready for QA review"
```

**Status Values:** ready, in_progress, testing, completed

#### `note <taskId> <note>`
Add a note to a task. Timestamps are automatically added by the CLI.

```bash
pnpm pmac note FEAT-001 "Discovered dependency on external API"
# Results in: "2025-06-23 11:45:30 a.m. EDT: Discovered dependency on external API"
```

**Note**: The CLI automatically prepends timestamps with local date, time, and timezone. Do not include timestamp information in your note text.

#### `move <taskId> <targetPhase>`
Move a task to a different phase.

```bash
pnpm pmac move FEAT-001 testing
```

### Task Attribute Updates

#### `set <taskId> <attribute> <value>`
Update various task attributes.

```bash
# Update priority
pnpm pmac set FEAT-001 priority critical

# Update estimated hours
pnpm pmac set FEAT-001 estimated_hours 16

# Update title
pnpm pmac set FEAT-001 title "Enhanced user authentication system"

# Update assignee
pnpm pmac set FEAT-001 assignee "john.doe"

# Update dependencies (comma-separated)
pnpm pmac set FEAT-001 dependencies "INFRA-001,AUTH-001,DB-001"

# Update blocks (comma-separated)
pnpm pmac set FEAT-001 blocks "DEPLOY-001,TEST-001"

# Update requirements (comma-separated)
pnpm pmac set FEAT-001 requirements "req1,req2,req3"
```

**Supported Attributes:**
- `priority`: critical|high|medium|low
- `estimated_hours`: positive integer
- `title`: string
- `assignee`: string
- `dependencies`: comma-separated task IDs
- `blocks`: comma-separated task IDs
- `requirements`: comma-separated strings

### Dependency Management

#### `add-dep <taskId> <dependencyId>`
Add a dependency relationship with circular dependency detection.

```bash
pnpm pmac add-dep API-002 API-001
```

This makes `API-002` depend on `API-001`, meaning `API-001` must be completed before `API-002` can begin.

#### `rm-dep <taskId> <dependencyId>`
Remove a dependency relationship.

```bash
pnpm pmac rm-dep API-002 API-001
```

### Analysis & Validation

#### `validate`
Validate all task relationships and dependencies.

```bash
pnpm pmac validate
```

**Checks performed:**
- Dependency existence validation
- Circular dependency detection
- Block relationship validation
- Orphaned reference detection

#### `critical-path`
Display critical path analysis showing the longest sequence of dependent tasks.

```bash
pnpm pmac critical-path
```

**Output includes:**
- Entry points (tasks with no dependencies)
- Complete critical path sequence
- Total estimated hours for critical path
- Visual task status indicators

#### `phases`
List all available phases with their details.

```bash
pnpm pmac phases
```

### Bulk Operations

#### `bulk-phase <phase> <status>`
Update all tasks in a phase to the specified status.

```bash
# Mark all foundation tasks as completed
pnpm pmac bulk-phase foundation completed

# Mark all testing tasks as ready
pnpm pmac bulk-phase testing ready
```

## Advanced Usage

### Circular Dependency Prevention

The CLI automatically prevents circular dependencies:

```bash
# This will succeed
pnpm pmac add-dep TASK-B TASK-A

# This will fail with error message
pnpm pmac add-dep TASK-A TASK-B
```

### Batch Dependency Updates

Use the `set` command for bulk dependency updates:

```bash
# Replace all dependencies at once
pnpm pmac set TASK-001 dependencies "DEP-1,DEP-2,DEP-3"

# Clear all dependencies
pnpm pmac set TASK-001 dependencies ""
```

### Task Status Workflow

Recommended task status progression:

1. **ready** → Task is defined and ready to begin
2. **in_progress** → Work has started
3. **testing** → Implementation complete, under review/testing
4. **completed** → Fully done and validated

### Priority Guidelines

- **critical**: Blocking multiple tasks or project timeline
- **high**: Important for current sprint/milestone
- **medium**: Standard priority work
- **low**: Nice-to-have or future considerations

## Configuration

### YAML File Location

By default, the CLI looks for `project-backlog.yml` in the current working directory. This can be customized by modifying the `backlogPath` in the CLI source.

### Customizing the CLI

The CLI is designed to be self-contained and easily customizable:

1. **Adding New Commands**: Extend the switch statement in the CLI interface
2. **Custom Validation**: Modify the `validateDependencies` method
3. **Output Formatting**: Update the status/priority icon methods
4. **New Attributes**: Add cases to the `updateTaskAttribute` method

## Testing

The CLI includes a comprehensive test suite with 90%+ coverage.

### Running Tests

```bash
# Run all tests
npx vitest run --config tools/vitest.config.ts

# Run with coverage
npx vitest run --config tools/vitest.config.ts --coverage

# Watch mode for development
npx vitest --config tools/vitest.config.ts
```

### Test Structure

The test suite covers:

- ✅ Task CRUD operations
- ✅ Status and attribute updates
- ✅ Dependency management
- ✅ Circular dependency prevention
- ✅ Task movement between phases
- ✅ Validation logic
- ✅ Error handling
- ✅ Array input parsing
- ✅ File I/O operations

### Coverage Thresholds

- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%
- **Statements**: 90%

## Contributing

### Development Setup

1. **Clone/Copy Files**: Ensure all CLI files are in your `tools/` directory
2. **Install Dependencies**: Run `pnpm install` (or `npm install`)
3. **Run Tests**: Verify everything works with `npx vitest run --config tools/vitest.config.ts`

### Code Style

- Use TypeScript with strict typing
- Follow existing naming conventions
- Add tests for new functionality
- Update documentation for new features

### Adding New Features

1. **Add Method**: Implement new functionality in the `PMaCCLI` class
2. **Add CLI Command**: Extend the switch statement for new commands
3. **Add Tests**: Create comprehensive test coverage
4. **Update Docs**: Document the new feature in this README

## PMaC Methodology

This CLI implements the Project Management as Code (PMaC) methodology, which treats project management data as code:

### Core Principles

1. **Version Controlled**: All project data in Git alongside code
2. **Human Readable**: YAML format accessible to all team members
3. **Automated**: CLI tools for efficient management
4. **Auditable**: Complete change history and audit trail
5. **Collaborative**: Merge conflicts resolve project management conflicts

### File Structure

```
project-root/
├── project-backlog.yml          # Main task management file
├── prompts-log.md               # Decision and conversation log  
├── project-management-as-code.md # Methodology documentation
├── CLAUDE.md                    # AI assistant instructions
└── tools/
    ├── pmac.ts                  # CLI implementation
    ├── pmac.test.ts             # Test suite
    ├── vitest.config.ts         # Test configuration
    └── PMAC_CLI_README.md       # This documentation
```

### Integration with AI Development

The CLI is designed to work seamlessly with AI coding assistants:

- **Structured Data**: AI can read and update YAML programmatically
- **Audit Trail**: All changes logged with timestamps and context
- **Validation**: Prevents AI from creating invalid project states
- **Standard Interface**: Consistent commands across different projects

### Best Practices

1. **Commit PMaC Files**: Always commit project-backlog.yml with code changes
2. **Update Status Regularly**: Keep task statuses current for accurate tracking
3. **Document Decisions**: Use notes to capture important context
4. **Validate Frequently**: Run `validate` command before major commits
5. **Review Critical Path**: Monitor critical path for timeline impact

---

## License

MIT License - Copyright (c) 2025 John C. Anderson (https://github.com/andersonjc)

This PMaC CLI tool and methodology documentation are licensed under the MIT License, making them freely available for use in any project implementing the Project Management as Code methodology. 

**Scope**: This license applies specifically to:
- PMaC CLI tools (`tools/pmac.ts`, `tools/pmac.test.ts`, etc.)
- PMaC methodology documentation (`project-management-as-code.md`, this README)
- PMaC workflow files and templates
- Associated testing and configuration files for PMaC components

**Attribution Required**: When using these PMaC components in other projects, please retain the copyright notice and include attribution to the original project.

**Note**: This license does not extend to the Communities Platform application code, which remains proprietary. Only PMaC-related components are open source under MIT License.

## Support

For issues, questions, or contributions related to the PMaC CLI:

1. Check the test suite for expected behavior
2. Review this documentation for usage patterns  
3. Examine the source code for implementation details
4. Contribute improvements back to the PMaC standard

The CLI is designed to be self-contained and easily portable between projects using the PMaC methodology.