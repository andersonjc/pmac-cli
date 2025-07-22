# 📦 CHANGELOG

All notable changes to this project will be documented in this file.

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

