# 📦 CHANGELOG

All notable changes to this project will be documented in this file.

---

## [1.3.0] - 2025-07-26

> Phase management and enhanced validation with timestamp improvements 🛠

### 🚀 New Features

- **Phase Creation Command**: Added `pmac phase-create <phaseId> <title> <description> [duration]` command for creating new project phases
- **Enhanced Task ID Validation**: Intelligent suggestions for alternative task IDs when duplicates are detected
- **Pattern Validation**: Smart recommendations for better task ID conventions (uppercase, numbered patterns)
- **Cross-Phase Uniqueness**: Clear error messages showing which phase contains existing task IDs

### 🛠 Fixes

- **Timestamp Standardization**: All timestamp generation now uses consistent PMaC format: `YYYY-MM-DD HH:MM:SS a.m./p.m. [LOCAL_TZ]`
- **Dynamic Timezone Detection**: Timestamps now detect actual local timezone instead of hardcoded EDT
- **TypeScript Compilation**: Fixed unused variable error in `suggestTaskIds` method
- **Code Quality**: Centralized timestamp logic, eliminated code duplication

### 📚 Documentation

- **Task ID Uniqueness**: Updated all documentation to clarify task IDs must be unique across entire backlog
- **Enhanced Help Text**: Phase creation command included in help output with examples
- **Error Messages**: Improved clarity about uniqueness requirements and validation failures
- **README Updates**: Added task ID uniqueness requirements and best practices

### 🧪 Testing

- Added 5 new tests for phase creation functionality
- Added cross-phase uniqueness validation test
- Enhanced test descriptions for better clarity
- All 69 tests passing with new functionality
- Comprehensive test coverage for timestamp methods

### 🎯 Performance

- **Centralized Logic**: All timestamp generation through single `formatTimestamp()` method
- **Reduced Duplication**: Eliminated 24+ lines of duplicate timestamp code
- **Improved Validation**: Faster task ID suggestion algorithms

### 🔧 Internal

- Cleaned up test data from project backlog
- Improved code organization and maintainability
- Better error handling and user experience
- Enhanced CLI usability with smart suggestions

---

## [1.2.0] - 2025-07-24

> Enhanced viewer reliability and CLI usability improvements 🔧

### 🚀 New Features

- **Version Display**: Added `--version`, `-v`, and `version` commands to display package version
- **Dynamic Port Selection**: Viewer automatically finds available ports when default port 5173 is in use
- **Enhanced Help Output**: Help command now displays version information in header and examples

### 🛠 Fixes

- **Viewer Path Resolution**: Fixed viewer command failing in global installations by implementing robust package root detection
- **Port Conflict Handling**: Viewer now gracefully handles port conflicts with clear user messaging
- **Version Detection**: Fixed version display showing "unknown" in global installations
- **Error Messages**: Improved viewer error messages with debugging information and solution suggestions

### 🧪 Testing

- Added 5 new unit tests for port discovery functionality
- Added 3 new integration tests for viewer command with port conflict scenarios
- All 58 tests passing including new functionality
- Improved test reliability and coverage for edge cases

### 🎯 Performance

- **Automatic Port Discovery**: `findAvailablePort()` efficiently scans for available ports (5173-5182 range)
- **Smart Path Resolution**: Package root detection works across development and production environments
- **Enhanced User Experience**: Clear messaging when alternate ports are used

### 📚 Documentation

- Updated help text and usage examples for consistency
- Added version command documentation and examples
- Enhanced error messages with actionable troubleshooting steps

### 🔧 Internal

- Refactored version detection to use same robust path logic as viewer assets
- Improved error handling and fallback mechanisms
- Enhanced TypeScript type safety and code organization

---

## [1.0.0] – 2025-07-22

> Initial public release of `pmac-cli` 🎉

### ✨ Features

- **PMaC CLI Tooling**:
  - Structured command-line interface for Project Management as Code methodology
  - YAML-based task tracking (`project-backlog.yml`) with phases, dependencies, and audit notes
  - Full support for task creation, status updates, dependency management, and bulk operations
  - Built-in commands for critical path analysis and dependency validation

- **Interactive Backlog Viewer**:
  - Svelte-based visual interface for navigating project tasks
  - Filter by status, priority, and phase
  - Visualize dependency graphs and critical paths
  - Mobile-friendly with dark mode and responsive design

- **Templates & Methodology Files**:
  - Auto-generated `project-backlog.yml`, `CLAUDE.md`, `project-requirements.md`, and `prompts-log.md`
  - `pmac init` command supports both new and existing projects

- **AI-Native Support**:
  - Format and structure optimized for use with AI assistants like Claude Code
  - Task metadata and decision logs designed for machine-readability and reproducibility

### 🧪 Testing

- CLI: Unit and integration tests for command logic and file operations
- Viewer: Component tests for backlog parsing, filtering, and rendering
- Coverage reports integrated via `vitest` for both CLI and Viewer

### 🧰 Dev Environment

- Modular TypeScript codebase with separate configs for CLI and Viewer
- ESLint, Prettier, TailwindCSS, and PostCSS for consistent code quality
- `pnpm` workspaces and build/test/lint scripts

### 📄 License

- MIT License covering CLI tooling, templates, and methodology documentation

---
