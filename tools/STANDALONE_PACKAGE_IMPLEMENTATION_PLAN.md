# PMaC Standalone Package Implementation Plan

## Executive Summary

This document outlines the strategy for converting the PMaC (Project Management as Code) toolkit into a standalone npm package that can be cleanly integrated into any project without dependency pollution.

**Goal**: Enable developers to add PMaC to their project with a single installation (`npm install @pmac/cli`) and use both CLI and viewer tools via the familiar `pmac` command.

## Branch Analysis and Strategy

### Current Project Analysis

**Master Branch** (Methodology Foundation):

- Clean methodology focus with minimal dependencies
- Core PMaC documentation and templates
- Basic CLI without viewer complexity
- Perfect foundation for methodology repository

**Feature/PMaC-Backlog-Viewer Branch** (Tools Foundation):

- Complete viewer implementation with 9 Svelte components
- Full build system with Vite, Tailwind, ESLint
- All dependencies needed for npm package
- 25+ commits of working tooling development

**Repository Strategy**: Clone feature branch to create pmac-cli, keep master as methodology base

## Repository Architecture Strategy

### Current State Analysis

The current PMaC repository at https://github.com/andersonjc/pmac combines:

- **Methodology documentation** (core PMaC concepts, principles, workflows)
- **Development tools** (CLI, viewer, build system)
- **Templates and examples** (project-backlog.yml, CLAUDE.md, etc.)
- **Implementation artifacts** (tests, coverage, build configs)

### Strategic Decision: Separate Repositories

**RECOMMENDATION**: Extract tools into separate repository while maintaining methodology repository.

#### Repository Separation Benefits

**Development Benefits:**

- **Independent versioning**: Tools can iterate rapidly without affecting methodology stability
- **Focused repositories**: Each repo has single responsibility and clear purpose
- **Easier maintenance**: Separate CI/CD, testing, and release processes
- **Better collaboration**: Contributors can focus on methodology OR tools
- **Cleaner git history**: Tool development vs methodology refinement tracked separately

**User Experience Benefits:**

- **Clear adoption path**: Users can adopt methodology without tools, or tools without full methodology
- **Reduced complexity**: No need to understand viewer code to use methodology
- **Faster tool installation**: Lightweight npm package without methodology docs
- **Better discoverability**: Tools show up in npm search, methodology in GitHub/documentation

**Technical Benefits:**

- **Clean dependencies**: Tools repo only contains what's needed for npm package
- **Optimized for use case**: Methodology optimized for reading/forking, tools for installation
- **Easier testing**: Tools can have comprehensive CI/CD without methodology overhead
- **12-Factor compliance**: "One codebase per application" principle

### Proposed Repository Structure

#### PMaC Methodology Repository (Current - Refactored)

**Repository**: `https://github.com/andersonjc/pmac` (keep existing URL)
**Foundation**: Master branch (clean methodology focus)

```
pmac/
├── README.md                         # Overview + link to tools
├── project-management-as-code.md     # Core methodology
├── CLAUDE.md                         # AI assistant guidance
├── templates/                        # All project templates
│   ├── project-backlog.yml
│   ├── project-requirements.md
│   ├── ADR-template.md
│   └── prompts-log.md
└── LICENSE
```

#### PMaC Tools Repository (New)

**Repository**: `https://github.com/andersonjc/pmac-cli` (new)
**Foundation**: Feature/PMaC-Backlog-Viewer branch (complete tooling)

```
pmac-cli/
├── README.md                    # Tool installation/usage
├── package.json                 # @pmac/cli package
├── bin/pmac.js                  # CLI entry point
├── lib/                         # Core functionality from tools/
├── viewer/                      # Pre-built viewer assets
│   ├── index.html
│   └── assets/
├── templates/                   # Essential templates only
└── tests/                       # Comprehensive tool tests
```

### Cross-Repository Linking Strategy

#### In PMaC Methodology Repository README:

````markdown
## Tools and Installation

To use PMaC with your projects, install the official CLI tools:

```bash
npm install -g @pmac/cli
# or
npx @pmac/cli --help
```
````

**Features:**

- ✅ Task management CLI
- ✅ Interactive backlog viewer
- ✅ Project templates
- ✅ Validation tools

**Documentation:** [PMaC CLI Documentation](https://github.com/andersonjc/pmac-cli)

````

#### In PMaC Tools Repository README:
```markdown
## Project Management as Code CLI

Official tooling for the [PMaC methodology](https://github.com/andersonjc/pmac).

### Quick Start
```bash
npm install -g @pmac/cli
pmac init    # Initialize PMaC in your project
pmac viewer  # Launch interactive backlog viewer
````

### Learn PMaC Methodology

- 📚 [Complete Methodology Guide](https://github.com/andersonjc/pmac)
- 🎯 [Templates](https://github.com/andersonjc/pmac/tree/master/templates)

````

## Package Naming Strategy

### The Problem
- `pmac` package name already exists on npm (Postman as Code, last updated 3 years ago)
- Need unique package name while maintaining familiar `pmac` command

### The Solution
**npm package name ≠ binary command name**

```json
{
  "name": "@pmac/cli",
  "bin": {
    "pmac": "./bin/pmac.js"
  }
}
````

### Recommended Package Names (in order of preference)

1. `@pmac/cli` - Scoped package (preferred)
2. `project-management-as-code` - Descriptive name
3. `pmac-toolkit` - Simple alternative
4. `pmac-dev` - Development-focused naming

## Technical Architecture

### Standalone Package Structure

```
@pmac/cli/
├── package.json           # Unique name, "pmac" binary
├── bin/
│   └── pmac.js           # CLI entry point
├── lib/
│   ├── cli.js            # Core CLI logic
│   ├── backlog-parser.js # YAML parsing utilities
│   ├── server.js         # HTTP server for viewer
│   └── utils.js          # Shared utilities
├── viewer/               # Pre-built static assets
│   ├── index.html
│   ├── assets/
│   │   ├── app.js        # Bundled Svelte app
│   │   └── app.css       # Bundled styles
│   └── static/           # Icons, images, etc.
├── templates/
│   ├── project-backlog.yml
│   ├── project-requirements.md
│   ├── ADR-template.md
│   └── prompts-log.md
└── docs/
    └── project-management-as-code.md
```

### Key Technical Decisions

**Pre-built Viewer Assets**

- Build viewer during package creation, not in target projects
- Include all assets in published package
- CLI serves assets using Node.js built-in http server
- No runtime build dependencies needed

**Minimal Runtime Dependencies**

- Only core dependencies: yaml parser, Node.js built-ins
- No Svelte, Vite, or build tools in production package
- Keeps package size small and installation fast

**Universal Compatibility**

- Works with any project type (not just Node.js)
- No package.json modifications required in target projects
- Self-contained methodology and tooling

## Phase-by-Phase Implementation Guide

### Phase 0: Repository Setup and Migration

**Tasks**:

1. Clone current repository to create pmac-cli from feature branch
2. Reset original repository to master branch for methodology focus
3. Set up cross-repository linking in README files

**Repository Setup Steps**:

```bash
# Create pmac-cli from feature branch
git clone https://github.com/andersonjc/pmac.git pmac-cli
cd pmac-cli
git checkout feature/PMaC-Backlog-Viewer

# Create new remote for pmac-cli
gh repo create andersonjc/pmac-cli --public
git remote set-url origin https://github.com/andersonjc/pmac-cli.git

# In original pmac repository, return to methodology focus
cd ../pmac
git checkout master
# Clean up - remove tool-specific configs added in feature branch
```

**Key Deliverables**:

- New `pmac-cli` repository with tools extracted
- Refactored `pmac` repository focused on methodology
- Updated README files with cross-repository links
- Initial package.json for `@pmac/cli`

### Phase 1: Package Restructuring

**Tasks**:

1. Update package.json to `@pmac/cli` with proper bin configuration
2. Restructure from tools/ directory to npm package layout
3. Pre-build viewer assets during package build process
4. Update CLI to serve viewer from package assets

**Key Changes**:

- Move `tools/pmac.ts` → `lib/cli.ts`
- Create `bin/pmac.js` entry point
- Build viewer to static assets in `viewer/`
- Remove methodology docs (link to main repository instead)

### Phase 2: Standalone Asset Generation

**Tasks**:

1. Create build script to generate static viewer assets
2. Implement HTTP server in CLI for serving pre-built viewer
3. Remove dependency on local viewer development setup
4. Test viewer functionality with bundled assets

**CLI Server Integration**:

```javascript
// In lib/server.js
const viewerPath = path.join(__dirname, '../viewer');
const server = http.createServer((req, res) => {
  // Serve static files from viewer/ directory
  serveStaticFile(req, res, viewerPath);
});
```

**Viewer Command Changes**:

```javascript
// In lib/cli.js
case 'viewer':
  const server = createViewerServer();
  server.listen(5173, () => {
    console.log('🚀 PMaC Viewer running at http://localhost:5173');
    open('http://localhost:5173'); // Optional: auto-open browser
  });
  break;
```

### Phase 3: Distribution & Testing

**Tasks**:

1. Set up npm publishing workflow
2. Test global and local installation
3. Verify cross-platform compatibility
4. Create installation documentation

**Installation Methods to Test**:

```bash
# Global installation
npm install -g @pmac/cli
pmac --help

# Local installation
npm install @pmac/cli
npx pmac --help

# Direct usage
npx @pmac/cli --help
```

**Cross-platform Testing**:

- Windows (WSL and native)
- macOS (Intel and Apple Silicon)
- Linux (Ubuntu/Debian)
- Different Node.js versions (18, 20, 22)

### Phase 4: Documentation & Release

**Tasks**:

1. Update both repositories with cross-references
2. Create migration guide for users
3. Publish to npm registry
4. Update existing projects to use new package

**Migration Guide Content**:

````markdown
# Migrating to Standalone PMaC Package

## Before (Current)

```bash
# Clone pmac repository
git clone https://github.com/andersonjc/pmac
cd pmac
pnpm install
pnpm pmac list
```
````

## After (Standalone Package)

```bash
# Install globally
npm install -g @pmac/cli
pmac list

# Or use locally
npm install @pmac/cli
npx pmac list
```

## Repository Changes

- **Methodology**: https://github.com/andersonjc/pmac
- **Tools**: https://github.com/andersonjc/pmac-cli

## Benefits

- No repository cloning required
- Works with any project type
- Clean dependency management
- Consistent versioning
- Separated concerns (methodology vs tools)

````

**Documentation Updates Required**:
- Update methodology repository README
- Create comprehensive tools repository README
- Update all existing documentation references
- Create getting-started guides for both repositories
- Update examples to use npm package instead of local tools

## Risk Assessment: LOW

### Advantages
- Current codebase is well-structured and modular
- Viewer already builds to static assets
- CLI is already self-contained
- No breaking changes to user experience
- Familiar `pmac` command preserved

### Potential Challenges
1. **Asset serving**: Requires basic HTTP server (easy to implement)
2. **Cross-platform compatibility**: Need to ensure works on Windows/macOS/Linux
3. **Initial npm publishing setup**: First-time npm publishing workflow
4. **Version management**: Coordinating CLI and viewer versions

### Mitigation Strategies
1. Use Node.js built-in `http` module for asset serving
2. Test on multiple platforms during Phase 3
3. Follow npm publishing best practices
4. Use single package version for both CLI and viewer

## Benefits of Standalone Package Approach

### Developer Experience
- **Single installation**: `npm install @pmac/cli` or `pnpm add @pmac/cli`
- **Single command interface**: `pmac list`, `pmac viewer`, `pmac validate`
- **Consistent versioning**: All tools updated together
- **Universal compatibility**: Works with any project type

### Maintenance Benefits
- **Single package to maintain**: Easier releases and updates
- **Shared dependencies**: No version conflicts
- **Consistent build process**: Single build pipeline
- **Tool compatibility**: Ensures CLI and viewer work together

### Clean Integration
- **Zero dependency pollution**: Target projects stay clean
- **Self-contained**: All assets bundled in package
- **No configuration required**: Works out of the box
- **Framework agnostic**: PHP, Python, Go, Rust, etc.

## Command Interface Design

### Core Commands
```bash
pmac init                    # Initialize project with templates
pmac list                    # Show current tasks
pmac update <task-id> <status> [note]  # Update task status
pmac viewer                  # Launch viewer (serves pre-built assets)
pmac validate                # Validate backlog format
pmac --help                  # Show all commands
````

### Viewer Integration

```bash
pmac viewer                  # Start viewer server
pmac viewer --port 8080      # Custom port
pmac viewer --no-open        # Don't auto-open browser
pmac viewer --backlog path/to/backlog.yml  # Custom backlog file
```

## Testing Strategy

### Unit Tests

- CLI command parsing
- Backlog YAML parsing
- Task status updates
- Template generation

### Integration Tests

- Viewer asset serving
- HTTP server functionality
- Cross-platform compatibility
- Package installation scenarios

### End-to-End Tests

- Complete workflow from init to viewer
- Multiple project types
- Global vs local installation
- npx usage scenarios

## Success Metrics

### Technical Metrics

- Package size < 10MB
- Installation time < 30 seconds
- Viewer startup time < 5 seconds
- Cross-platform compatibility 100%

### User Experience Metrics

- Zero configuration required
- Single command installation
- Familiar command interface
- Clean project integration

## Future Enhancements

### Phase 5: Advanced Features (Future)

- **Plugin system**: Allow custom viewers and commands
- **Cloud integration**: Sync backlogs across teams
- **IDE extensions**: VSCode, JetBrains integration
- **CI/CD integration**: GitHub Actions, GitLab CI

### Phase 6: Ecosystem (Future)

- **Template marketplace**: Community-contributed templates
- **Methodology extensions**: Agile, Kanban, etc.
- **Export formats**: PDF, Excel, Jira integration
- **Analytics**: Project health metrics

## Implementation Summary

### Repository Strategy

**Methodology Repository**: Use master branch as clean foundation (https://github.com/andersonjc/pmac)
**Tools Repository**: Clone from feature/PMaC-Backlog-Viewer branch (https://github.com/andersonjc/pmac-cli)

### Key Benefits

- **Clean separation**: Methodology stays lightweight, tools get full npm package treatment
- **Proven implementation**: Feature branch has working viewer with complete build system
- **Easy adoption**: Users can install tools via npm or learn methodology independently
- **Independent evolution**: Tools and methodology can be updated separately

## Conclusion

This implementation plan provides a clear path to transform PMaC into a standalone, universally compatible package while preserving the familiar developer experience. The repository separation strategy ensures clean separation of concerns and optimal user experience for both methodology adoption and tool usage.

**Next Steps**: Begin with Phase 0 using your branch-based approach for optimal separation of methodology and tooling.
