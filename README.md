# pmac-cli - Project Management as Code Tools

A comprehensive CLI toolkit and interactive viewer for implementing Project Management as Code (PMaC) methodology in AI-assisted development workflows.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![NPM Package](https://img.shields.io/badge/npm-pmac--cli-blue)](https://www.npmjs.com/package/pmac-cli)

## Overview

**pmac-cli** provides tools that support the [Project Management as Code (PMaC) methodology](https://github.com/andersonjc/pmac/blob/master/project-management-as-code.md) - a file-based approach to managing AI-assisted software development that keeps all project management data version-controlled alongside your codebase.

### Why PMaC?

Traditional project management tools store data in proprietary systems that don't integrate well with AI coding assistants. PMaC solves this by using **version-controlled files** that provide complete project context to both humans and AI.

**Key Benefits:**
- 🤖 **AI-Native**: Structured YAML/Markdown that AI assistants can read and update
- 📝 **Complete Audit Trail**: Every decision, requirement change, and prompt is tracked
- ⚡ **Zero Context Loss**: Resume complex projects seamlessly with full historical context
- 🔄 **Git Integration**: Project management data evolves with your code
- 🏗️ **Quality Assurance**: Built-in protocols ensure production-ready code

## Installation

```bash
# Install globally (recommended)
npm install -g pmac-cli

# Or install as dev dependency
npm install --save-dev pmac-cli
```

## Quick Start

### Initialize a new PMaC project

```bash
# Create project structure
pmac init my-project
cd my-project

# Create your first task
pmac create SETUP-001 "Initialize development environment" foundation high 4

# Start working
pmac update SETUP-001 in_progress "Setting up TypeScript configuration"
```

### Use with existing projects

```bash
# Add PMaC to your existing project
cd your-existing-project
pmac init --existing

# The CLI will create:
# - project-backlog.yml (task management)
# - prompts-log.md (decision history)  
# - project-requirements.md (technical specs)
# - README.md (project documentation)
# - CLAUDE.md (AI assistant instructions)
```

## PMaC CLI Commands

### Task Management

```bash
# List tasks with optional filtering
pmac list                           # All tasks
pmac list in_progress              # Only in-progress tasks
pmac list ready high               # Ready tasks with high priority

# Create and manage tasks
# Note: Task IDs must be unique across entire backlog
pmac create TASK-001 "Task title" phase [priority] [hours]
pmac update TASK-001 in_progress "Starting implementation"
pmac note TASK-001 "Important discovery about requirements"
pmac move TASK-001 testing

# Update task attributes
pmac set TASK-001 priority critical
pmac set TASK-001 estimated_hours 16
pmac set TASK-001 assignee "developer-name"
```

### Dependencies & Analysis

```bash
# Manage task dependencies
pmac add-dep TASK-002 TASK-001     # TASK-002 depends on TASK-001
pmac rm-dep TASK-002 TASK-001      # Remove dependency

# Project analysis
pmac critical-path                 # Show longest dependency chain
pmac validate                      # Check for circular dependencies
pmac phases                        # List all project phases
```

### Bulk Operations

```bash
# Update all tasks in a phase
pmac bulk-phase foundation completed

# Set multiple dependencies
pmac set TASK-001 dependencies "DEP-1,DEP-2,DEP-3"
```

### Prompt Logging

```bash
# Log AI prompts with timestamps to prompts-log.md
pmac log-prompt "Implement user authentication system"
pmac log-prompt "Add error handling to payment processing"
```

## Optional Tools

### Git Pre-Commit Hook

PMaC CLI includes an optional pre-commit hook that enforces PMaC compliance by ensuring PMaC files are updated whenever code changes are committed.

**Installation** (optional):
```bash
# Copy the hook to your git hooks directory
cp tools/resources/pmac-pre-commit-hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**What it does**:
- Detects when code files are being committed
- Ensures corresponding PMaC files (`project-backlog.yml`, `prompts-log.md`) are also staged
- Auto-stages modified PMaC files if they exist but aren't staged
- Blocks commits that don't follow PMaC methodology

**Note**: This hook is a resource for teams that want to enforce PMaC compliance. It's not required to use PMaC methodology or tools.

## Interactive Backlog Viewer

Launch a web-based viewer for visual project management:

```bash
# Start viewer for current directory
pmac viewer

# Viewer with custom backlog path (global flag)
pmac --backlog path/to/project-backlog.yml viewer
```

### Viewer Features

- **Visual Task Cards**: Status indicators, priority badges, progress bars
- **Interactive Filtering**: Search text, filter by status/priority/phase
- **Critical Path Visualization**: SVG dependency graphs with zoom/pan
- **Phase Management**: Collapsible sections with completion metrics  
- **Task Detail Modals**: Complete task information with history
- **Dark Mode Interface**: Developer-friendly design with excellent contrast
- **Mobile Responsive**: Touch-friendly interface for all devices
- **URL State Persistence**: Shareable filtered views

## Project Structure

PMaC uses four interconnected files that work together:

```
your-project/
├── project-backlog.yml     # Task management and dependencies
├── prompts-log.md          # Complete conversation history  
├── CLAUDE.md               # AI assistant instructions
├── project-requirements.md # Technical architecture
├── src/                    # Your application code
└── package.json            # Dependencies including pmac-cli
```

### Core PMaC Files

| File | Purpose | AI Integration |
|------|---------|----------------|
| **`project-backlog.yml`** | Structured task data with phases, dependencies, status | AI can read/update tasks programmatically |
| **`prompts-log.md`** | Decision history and conversation log | AI maintains complete context across sessions |
| **`CLAUDE.md`** | Project-specific AI instructions | AI follows consistent protocols |
| **`project-requirements.md`** | Technical specifications | AI understands architecture constraints |

## Example Workflow

### 1. Pick a Task
```bash
pmac list ready high
```

### 2. Start Work
```bash
pmac update TASK-001 in_progress "Beginning implementation"
git checkout -b feature/TASK-001-description
```

### 3. AI-Assisted Development
With PMaC files in your repository, AI assistants have complete project context:
- Current task requirements and acceptance criteria
- Full dependency chain and blocking relationships
- Historical decisions and implementation notes
- Project architecture and constraints

### 4. Complete & Validate
```bash
# Mark as complete with note
pmac update TASK-001 completed "All acceptance criteria validated"

# Commit with PMaC context
git add .
git commit -m "TASK-001: Implement authentication system

✅ All acceptance criteria met
📝 Updated PMaC files
🤖 Generated with Claude Code"
```

## PMaC File Examples

### project-backlog.yml
```yaml
metadata:
  project: "E-commerce Platform"
  version: "1.0.0"
  
phases:
  foundation:
    title: "Foundation & Setup"
    status: "ready"
    estimated_duration: "1 week"
    tasks:
      - id: AUTH-001
        title: "Implement JWT Authentication"
        status: "ready"
        priority: "high"
        estimated_hours: 8
        requirements:
          - "JWT token generation endpoint"
          - "Token validation middleware"
          - "Refresh token mechanism"
        acceptance_criteria:
          - "Users can login and receive valid tokens"
          - "Protected routes validate tokens correctly"
          - "All tests pass with >95% coverage"
        dependencies: ["SETUP-001"]
        notes: []
```

## Integration with AI Development

PMaC is designed specifically for AI-assisted development:

### Structured Context
- AI can parse YAML/Markdown programmatically
- Complete project state always available
- No external API dependencies

### Audit Trail
- Every AI prompt logged with timestamps
- Implementation decisions tracked
- Full conversation history preserved

### Quality Assurance
- Acceptance criteria must be validated
- Dependencies prevent premature work
- Testing requirements enforced

### Consistency
- Standard commands across all projects
- Familiar patterns for AI assistants
- Prevents context drift between sessions

## Advanced Features

### Critical Path Analysis
```bash
pmac critical-path
```
Shows the longest sequence of dependent tasks, helping identify project bottlenecks and timeline risks.

### Dependency Validation
```bash
pmac validate
```
Comprehensive validation including:
- Circular dependency detection
- Orphaned task references
- Invalid status transitions
- Missing dependency targets

### Bulk Operations
```bash
# Complete an entire phase
pmac bulk-phase testing completed

# Update multiple task attributes
pmac set TASK-001 dependencies "A,B,C" blocks "X,Y,Z"
```

### Viewer Integration
The interactive viewer integrates seamlessly with CLI operations:
- Real-time updates when CLI modifies backlog
- Visual dependency graphs
- Export capabilities for reporting
- Mobile-friendly interface

## PMaC Methodology

📚 **[Complete PMaC Methodology Documentation](https://github.com/andersonjc/pmac/blob/master/project-management-as-code.md)**

### Core Principles

1. **File-Based**: All project data in version-controlled files
2. **AI-Native**: Structured for programmatic access by AI
3. **Audit Trail**: Complete history of decisions and changes  
4. **Quality First**: Built-in protocols ensure production readiness
5. **Context Preservation**: Zero information loss across sessions

### Senior Engineer Protocol

PMaC includes a **Senior Engineer Task Execution Protocol**:

1. **📋 Clarify Scope**: Map requirements to specific implementation
2. **🎯 Locate Insertion Points**: Identify exact files and lines to modify  
3. **⚡ Minimal Changes**: Only code required for acceptance criteria
4. **✅ Validate Everything**: Run tests, check criteria, verify no regressions
5. **📝 Document & Update**: Update PMaC files with all changes

## Best Practices

### For Teams
- Always commit PMaC files with code changes
- Use globally unique task IDs in branch names and commit messages  
- Include acceptance criteria validation in PRs
- Review PMaC files during code reviews

### For AI Collaboration
- Log every prompt and decision in `prompts-log.md`
- Update task status as work progresses
- Reference task IDs when asking for help
- Maintain complete audit trail

### For Quality
- Write specific, testable acceptance criteria
- Aim for 100% test coverage on new code
- Follow the Senior Engineer Protocol
- Validate all criteria before marking tasks complete

## Browser Support

**Viewer Requirements:**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript enabled
- Modern ES6+ support

## Contributing

We welcome contributions to improve PMaC methodology and tooling!

### Development Setup
```bash
git clone https://github.com/andersonjc/pmac-cli.git
cd pmac-cli
pnpm install
pnpm test
```

### Contributing Guidelines
1. Follow PMaC methodology for all changes
2. Add tests for new CLI features
3. Update documentation for new features
4. Include PMaC file updates in PRs

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support & Resources

- **📖 Complete Methodology**: [PMaC Documentation](https://github.com/andersonjc/pmac/blob/master/project-management-as-code.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/andersonjc/pmac-cli/issues)
- **📦 NPM Package**: [pmac-cli](https://www.npmjs.com/package/pmac-cli)

---

**Ready to revolutionize your AI-assisted development workflow?** Install `pmac-cli` and experience the power of Project Management as Code. 🚀