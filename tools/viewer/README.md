# PMaC Backlog Viewer

A Svelte application for visualizing and managing Project Management as Code (PMaC) backlogs with interactive task filtering, dependency visualization, and critical path analysis.

## Features

### Core Functionality

- **YAML Parsing**: Robust parsing and validation of PMaC backlog files
- **Interactive Task Visualization**: Visual task cards with status, priority, and progress indicators
- **Advanced Filtering**: Search, filter by status/priority/phase, and combine filters
- **Critical Path Analysis**: SVG-based dependency graph with interactive tooltips
- **Dark Mode Interface**: Modern, developer-friendly dark theme with excellent contrast
- **Responsive Design**: Mobile-friendly interface with touch support
- **Error Handling**: Comprehensive error messages and graceful degradation

### PMaC Integration

- **CLI Integration**: Direct integration with PMaC CLI commands
- **Live Updates**: Real-time backlog monitoring and updates
- **Dependency Tracking**: Visual representation of task dependencies and blockers
- **Phase Management**: Collapsible phase groups with progress indicators
- **Project Statistics**: Overview cards with completion metrics

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- PMaC CLI (included in parent directory)

### Setup

1. **Navigate to the PMaC project directory**:

   ```bash
   cd path/to/pmac/project
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Ensure your project has a PMaC backlog file** (typically `project-backlog.yml`):
   ```yaml
   metadata:
     project: 'Your Project Name'
     version: '1.0.0'
     # ... other metadata
   phases:
     # ... your phases and tasks
   ```

## Usage

### Basic Usage

#### Start the viewer from your project directory:

```bash
# Using PMaC CLI (recommended)
pnpm pmac viewer

# Or with explicit backlog path
pnpm pmac --backlog path/to/project-backlog.yml viewer
```

#### Development mode:

```bash
# Start development server
pnpm pmac viewer dev

# Build for production
pnpm pmac viewer build
```

### CLI Commands

| Command                              | Description                            |
| ------------------------------------ | -------------------------------------- |
| `pnpm pmac viewer`                   | Launch viewer for current directory    |
| `pnpm pmac --backlog [path] viewer`  | Launch viewer with custom backlog path |
| `pnpm pmac viewer dev`               | Start development server               |
| `pnpm pmac viewer build`             | Generate static build                  |

### Interface Guide

#### Main Components

1. **Project Overview**:
   - Project statistics and completion metrics
   - Progress visualization with completion percentage
   - Timeline information from epic summary

2. **Filter Panel**:
   - Text search across task titles and descriptions
   - Status filter (completed, in_progress, ready, blocked)
   - Priority filter (critical, high, medium, low)
   - Phase filter (filter by project phases)
   - Clear filters button

3. **Phase Groups**:
   - Collapsible sections for each project phase
   - Progress rings showing phase completion
   - Task count and hours summary
   - Click to expand/collapse phases

4. **Task Cards**:
   - Task ID, title, and description
   - Status indicators with color coding
   - Priority badges
   - Progress bars for estimated vs actual hours
   - Dependency and blocker indicators
   - Click to open detailed view

5. **Task Detail Modal**:
   - Complete task information
   - Requirements and acceptance criteria
   - Dependency visualization
   - Task history and notes
   - Progress tracking

6. **Critical Path Visualization**:
   - SVG-based dependency graph
   - Interactive nodes with hover details
   - Critical path highlighting
   - Zoom and pan support

#### Status Color Coding

- **Completed**: Green (✅)
- **In Progress**: Blue (🔄)
- **Ready**: Gray (⏳)
- **Blocked**: Red (🚫)

#### Priority Indicators

- **Critical**: Red badge
- **High**: Orange badge
- **Medium**: Yellow badge
- **Low**: Green badge

### Advanced Features

#### URL State Persistence

Filters and view state are automatically saved to the URL, making it easy to share specific filtered views:

```
http://localhost:5173/?search=api&status=in_progress&priority=high
```

#### Mobile Support

- Touch-friendly interface
- Responsive breakpoints
- Mobile-optimized navigation
- Touch gestures for critical path zoom/pan

## Troubleshooting

### Common Issues

- **Error Loading Backlog**: Ensure project-backlog.yml exists and is valid YAML
- **No Tasks Found**: Check backlog has tasks defined, clear active filters
- **Critical Path Not Displaying**: Verify all dependency IDs reference valid tasks
- **Performance Issues**: Use filters to limit displayed tasks for large backlogs
- **Port Already in Use**: The viewer automatically finds an available port

### Development Debugging

#### Enable Debug Mode

```bash
# Start with debug logging
DEBUG=viewer:* pnpm pmac viewer dev
```

#### File Watching Issues

If the viewer doesn't update when backlog changes:
- Restart the viewer
- Check file permissions

## Development Guide

### Project Structure

```
tools/viewer/
├── src/
│   ├── components/          # Svelte components
│   ├── lib/                 # Utility libraries
│   │   ├── types.ts        # TypeScript interfaces
│   │   ├── stores.ts       # Svelte stores
│   │   └── parseBacklog.ts # YAML parsing
│   ├── App.svelte          # Main application
│   └── main.ts             # Entry point
├── public/                  # Static assets
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

### Contributing

#### 1. Setup Development Environment

```bash
# Clone repository
git clone <repository-url>
cd pmac/tools/viewer

# Install dependencies
pnpm install

# Start development server
pnpm pmac viewer dev
```

#### 2. Code Style

- Follow existing TypeScript and Svelte conventions
- Use Tailwind CSS for styling
- Maintain dark mode compatibility
- Write descriptive commit messages

#### 3. Testing

```bash
# Run tests
pnpm test:viewer

# Run with coverage
pnpm test:viewer:coverage
```

#### 4. Building

```bash
# Build for production
pnpm pmac build
```

### API Reference

#### Core Types

```typescript
interface ProjectBacklog {
  metadata: ProjectMetadata;
  phases: Record<string, Phase>;
  epic_summary?: EpicSummary;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_hours: number;
  // ... other fields
}
```

#### Store API

```typescript
// Filter state
filterState.set({ status: 'in_progress' });

// Selected task
selectedTask.set(task);

// Load backlog
loadBacklog(backlogData);
```

### Browser Compatibility

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## License

MIT License - See parent directory for full license details.

## Support

For issues: Check this troubleshooting guide, review PMaC methodology documentation, or create an issue in the project repository.

---

**PMaC Backlog Viewer** - Part of the Project Management as Code toolkit
