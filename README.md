# Project Management as Code (PMaC)

A file-based methodology and toolkit for AI-assisted software development that keeps all project management data version-controlled alongside your codebase.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tested with Vitest](https://img.shields.io/badge/tested_with-vitest-99424f.svg)](https://vitest.dev/)

## Why PMaC?

Traditional project management tools (Jira, Linear, Asana) store data in proprietary systems that don't integrate well with AI coding assistants. PMaC solves this by using **version-controlled files** that provide complete project context to both humans and AI.

### Key Benefits

- **🤖 AI-Native**: Structured YAML/Markdown that AI assistants can read and update
- **📝 Complete Audit Trail**: Every decision, requirement change, and prompt is tracked
- **⚡ Zero Context Loss**: Resume complex projects seamlessly with full historical context
- **🔄 Git Integration**: Project management data evolves with your code
- **🏗️ Quality Assurance**: Built-in protocols ensure production-ready code

📚 **[Read the Complete Methodology](project-management-as-code.md)** - Full documentation of the PMaC approach and workflows.

## Quick Start

### For New Projects

```bash
# Clone PMaC template
git clone https://github.com/andersonjc/pmac.git my-project
cd my-project

# Install CLI tool
pnpm add -D yaml tsx @types/node

# Initialize your project files
cp templates/* .
# Edit files to match your project

# Start managing tasks
pnpm pmac list
```

### For Existing Projects

```bash
# Add PMaC files to your existing project
curl -O https://raw.githubusercontent.com/andersonjc/pmac/main/templates/project-backlog.yml
curl -O https://raw.githubusercontent.com/andersonjc/pmac/main/templates/CLAUDE.md
curl -O https://raw.githubusercontent.com/andersonjc/pmac/main/templates/prompts-log.md

# Add CLI tool
pnpm add -D yaml tsx @types/node
# Copy tools/pmac.ts to your project
```

## Core PMaC Files

PMaC uses four interconnected files that work together:

| File | Purpose | Format |
|------|---------|---------|
| **`project-backlog.yml`** | Task management, dependencies, status tracking | YAML |
| **`prompts-log.md`** | Complete conversation history and decisions | Markdown |
| **`CLAUDE.md`** | AI assistant instructions and project guidance | Markdown |
| **`project-requirements.md`** | Technical architecture and requirements | Markdown |

## PMaC CLI

Powerful command-line tool for managing your PMaC workflow:

```bash
# Task Management
pnpm pmac list [status] [priority]     # List tasks with filters
pnpm pmac update TASK-001 in_progress  # Update task status
pnpm pmac create "New Feature" dev      # Create new task

# Project Analysis
pnpm pmac critical-path                 # Show project critical path
pnpm pmac validate                      # Validate dependencies
pnpm pmac phases                        # List all project phases

# Dependencies
pnpm pmac add-dep TASK-001 SETUP-001   # Add task dependency
pnpm pmac rm-dep TASK-001 SETUP-001    # Remove dependency
```

## Development Workflow

### 1. Pick a Task
```bash
pnpm pmac list ready high  # Find high-priority ready tasks
```

### 2. Start Work
```bash
pnpm pmac update TASK-001 in_progress "Starting implementation"
git checkout -b feature/TASK-001-description
```

### 3. Follow Protocol
- ✅ Read task requirements and acceptance criteria
- ✅ Follow technical requirements exactly
- ✅ Update task notes with implementation decisions
- ✅ Log all AI prompts in `prompts-log.md`

### 4. Complete & Validate
```bash
# Validate all acceptance criteria met
pnpm pmac update TASK-001 completed "All criteria validated"

# Commit PMaC files with code changes
git add .
git commit -m "TASK-001: Implement feature XYZ

✅ All acceptance criteria met
📝 Updated PMaC files
🤖 Generated with Claude Code"
```

## Project Structure

```
your-project/
├── project-backlog.yml           # Task management and tracking
├── prompts-log.md               # Complete conversation history  
├── CLAUDE.md                    # AI assistant instructions
├── project-requirements.md     # Technical requirements
├── tools/
│   ├── pmac.ts                 # PMaC CLI tool
│   └── pmac.test.ts            # CLI tests
├── src/                        # Your application code
└── README.md                   # Project documentation
```

## Example Task Structure

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
          - "Add refresh token mechanism"
        acceptance_criteria:
          - "✅ Users can login and receive valid JWT tokens"
          - "✅ Protected routes validate tokens correctly"
          - "✅ Refresh tokens work without re-authentication"
          - "✅ All tests pass with >95% coverage"
        dependencies: ["SETUP-001"]
        notes: []
```

## Quality Assurance

PMaC includes a **Senior Engineer Task Execution Protocol**:

1. **📋 Clarify Scope**: Map requirements to specific implementation
2. **🎯 Locate Insertion Points**: Identify exact files and lines to modify  
3. **⚡ Minimal Changes**: Only code required for acceptance criteria
4. **✅ Validate Everything**: Run tests, check criteria, verify no regressions
5. **📝 Document & Update**: Update PMaC files with all changes

## Best Practices

### For Teams
- Always commit PMaC files with code changes
- Use task IDs in branch names and commit messages  
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
- Follow the Senior Engineer Protocol religiously
- Validate all criteria before marking tasks complete

## Contributing

We welcome contributions to improve PMaC methodology and tooling!

### Development Setup
```bash
git clone https://github.com/andersonjc/pmac.git
cd pmac
pnpm install
pnpm test
```

### Contributing Guidelines
1. Follow PMaC methodology for all changes
2. Add tests for new CLI features
3. Update documentation for methodology changes
4. Include PMaC file updates in your PRs

## Real-World Usage

PMaC is designed for projects where:
- Multiple developers work with AI assistants
- Requirements evolve frequently
- Audit trails are important
- Quality and testing standards are high
- Context preservation is critical

**Perfect for**: Startups, enterprise features, open source projects, consulting work

**Works with**: Any AI assistant (Claude, GPT, etc.), any tech stack, any team size

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **📖 Documentation**: See `project-management-as-code.md` for complete methodology
- **🐛 Issues**: [Report bugs or request features](https://github.com/andersonjc/pmac/issues)
- **💬 Discussions**: [Join the community](https://github.com/andersonjc/pmac/discussions)

---

**Ready to try PMaC?** Start with the [complete methodology guide](project-management-as-code.md) or dive into the [template files](templates/).

Built for the era of AI-assisted development. 🚀