# PMaC Backlog Viewer - Technical Requirements

## Project Management as Code Implementation

This document defines the technical requirements and architecture for the PMaC Backlog Viewer, implemented using **Project Management as Code (PMaC)** methodology.

**Related PMaC Files:**
- `../../project-management-as-code.md` - Complete PMaC methodology
- `project-backlog.yml` - Task management and progress tracking  
- `prompts-log.md` - Complete development conversation log
- `../../CLAUDE.md` - AI assistant instructions

---

## Project Overview

### Mission Statement
Create a sleek, dark mode web application for visualizing PMaC project backlogs with interactive task management, dependency tracking, and critical path analysis.

### Target Users
- Developers using PMaC methodology
- Project managers working with AI-assisted development
- Teams wanting visual project backlog management

### Success Metrics
- Intuitive dark mode interface with high contrast accessibility
- Real-time YAML parsing and visualization
- Interactive task filtering and dependency visualization
- Seamless integration with existing PMaC CLI tool

---

## Technical Architecture

### Technology Stack

**Frontend:**
- **Framework**: Svelte 4.0+ with TypeScript
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 3.4+ with dark mode design system
- **Icons**: Lucide Svelte for consistent iconography

**Backend:**
- **Data Source**: Local YAML files (project-backlog.yml)
- **Parser**: YAML 2.8+ library for parsing backlog files
- **File System**: Node.js fs module for file operations

**Development:**
- **Package Manager**: pnpm (consistent with main project)
- **TypeScript**: 5.3+ for type safety
- **Testing**: Vitest for component and integration testing

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PMaC CLI      │    │   Viewer App    │    │   YAML Parser   │
│   (pnpm pmac    │───▶│   (Svelte +     │───▶│   (project-     │
│    viewer)      │    │    Tailwind)    │    │   backlog.yml)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Build  │    │   Dev Server    │    │   Task Data     │
│   (dist/)       │    │   (localhost)   │    │   (reactive)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Architecture

**Core Entities:**
- **Project**: Metadata and configuration from YAML
- **Phase**: Grouped collections of related tasks
- **Task**: Individual work items with status, priority, dependencies
- **Dependency**: Relationships between tasks for critical path analysis

**File Structure:**
```
tools/viewer/
├── src/
│   ├── lib/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── parseBacklog.ts       # YAML parsing logic
│   │   └── stores.ts             # Svelte reactive stores
│   ├── components/
│   │   ├── BacklogOverview.svelte
│   │   ├── PhaseGroup.svelte
│   │   ├── TaskCard.svelte
│   │   ├── TaskDetail.svelte
│   │   ├── CriticalPath.svelte
│   │   ├── DependencyGraph.svelte
│   │   └── RiskPanel.svelte
│   ├── styles/
│   │   └── app.css               # Tailwind + custom styles
│   ├── app.html                  # HTML template
│   ├── main.ts                   # App initialization
│   └── App.svelte                # Root component
├── project-backlog.yml           # Viewer development tasks
├── project-requirements.md       # This file
├── prompts-log.md               # Development decisions log
├── package.json                 # Dependencies
├── vite.config.ts               # Build configuration
└── tailwind.config.js           # Tailwind configuration
```

---

## Functional Requirements

### Core Features

#### Dark Mode Interface
**Description**: Professional dark theme optimized for developer workflows with high contrast and accessibility.

**User Stories**:
- As a developer, I want a dark interface that's easy on the eyes during long coding sessions
- As a project manager, I want clear visual hierarchy to quickly scan task status
- As a team lead, I want readable text and proper contrast for accessibility

**Acceptance Criteria**:
- Background uses gray-900 with gray-800 cards and gray-700 hover states
- Text uses gray-100 (primary), gray-300 (secondary), gray-400 (muted)
- Status indicators use appropriate opacity and color coding
- All elements meet WCAG AA contrast requirements

**Technical Requirements**:
- Tailwind CSS dark mode classes throughout
- Custom CSS variables for consistent theming
- Responsive design for various screen sizes

#### Task Visualization
**Description**: Interactive cards showing task status, priority, and dependencies with filtering capabilities.

**User Stories**:
- As a developer, I want to see task status at a glance with color coding
- As a project manager, I want to filter tasks by status and priority
- As a team member, I want to see task dependencies and blocking relationships

**Acceptance Criteria**:
- Task cards display ID, title, status, priority, and estimated hours
- Color-coded status indicators (green=completed, blue=in-progress, gray=pending, red=blocked)
- Priority badges with appropriate dark mode colors
- Hover states reveal additional task details
- Click to open detailed task modal

**Technical Requirements**:
- TaskCard.svelte component with reactive props
- Task filtering logic in stores.ts
- Modal component for task details

#### Critical Path Analysis
**Description**: Visual representation of task dependencies and project critical path.

**User Stories**:
- As a project manager, I want to see the critical path through the project
- As a developer, I want to understand which tasks are blocking others
- As a team lead, I want to identify bottlenecks in the project flow

**Acceptance Criteria**:
- SVG-based dependency graph with dark theme
- Critical path highlighted with glowing effect
- Interactive nodes showing task details on hover
- Zoom and pan functionality for large projects

**Technical Requirements**:
- CriticalPath.svelte component with SVG rendering
- Dependency calculation algorithm
- Interactive SVG event handling

#### Phase Management
**Description**: Organized display of project phases with task grouping and progress tracking.

**User Stories**:
- As a project manager, I want to see progress by project phase
- As a developer, I want to focus on current phase tasks
- As a stakeholder, I want to understand project timeline and milestones

**Acceptance Criteria**:
- Phase headers with title, description, and progress indicators
- Collapsible phase sections for focused viewing
- Task count and completion percentage per phase
- Estimated vs actual hours tracking

**Technical Requirements**:
- PhaseGroup.svelte component
- Progress calculation logic
- Collapsible state management

### PMaC CLI Integration

**Integration Method**: Extend existing PMaC CLI with viewer subcommand

**Commands**:
```bash
pnpm pmac viewer                              # View ./project-backlog.yml
pnpm pmac viewer ../project/project-backlog.yml  # Custom path
pnpm pmac viewer --build                      # Build static version
pnpm pmac viewer --serve                      # Serve built version
```

**Technical Requirements**:
- Add viewer command to existing PMaC CLI
- File path validation and error handling
- Development server spawning from CLI
- Static build generation

---

## Non-Functional Requirements

### Performance Requirements
- **Initial Load**: Under 2 seconds for typical project backlogs
- **File Parsing**: Under 500ms for YAML parsing and data transformation
- **UI Responsiveness**: 60fps animations and smooth scrolling
- **Memory Usage**: Under 100MB for large project backlogs

### Accessibility Requirements
- **Contrast Ratio**: WCAG AA compliant (4.5:1 minimum)
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators throughout

### Browser Support
- **Primary**: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- **Mobile**: iOS Safari 15+, Android Chrome 100+
- **JavaScript**: ES2020+ with Vite polyfills as needed

### Security Requirements
- **Local Only**: No network requests or data transmission
- **File Access**: Read-only access to specified YAML files
- **Input Validation**: Sanitized YAML parsing with error handling

---

## Development Standards

### Code Quality
- **TypeScript**: Strict mode enabled, no any types
- **Testing Coverage**: 90%+ coverage on business logic
- **Component Testing**: All Svelte components tested
- **Integration Testing**: End-to-end user workflows tested

### Development Workflow
- **Git Workflow**: Feature branches with PR review
- **PMaC Integration**: All changes logged in prompts-log.md
- **Task Tracking**: Development progress tracked in project-backlog.yml
- **Documentation**: Code comments and component documentation

### Styling Standards
- **Tailwind Only**: No custom CSS outside of Tailwind utilities
- **Dark Mode**: Consistent use of dark mode color palette
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Proper focus states and contrast ratios

---

## Dark Mode Design System

### Color Palette
```css
/* Background Colors */
--bg-primary: rgb(17 24 39);     /* bg-gray-900 */
--bg-secondary: rgb(31 41 55);   /* bg-gray-800 */
--bg-tertiary: rgb(55 65 81);    /* bg-gray-700 */

/* Text Colors */
--text-primary: rgb(243 244 246);   /* text-gray-100 */
--text-secondary: rgb(209 213 219); /* text-gray-300 */
--text-muted: rgb(156 163 175);     /* text-gray-400 */

/* Status Colors */
--status-completed: rgb(34 197 94);    /* green-500 */
--status-in-progress: rgb(59 130 246); /* blue-500 */
--status-pending: rgb(156 163 175);    /* gray-400 */
--status-blocked: rgb(239 68 68);      /* red-500 */

/* Priority Colors */
--priority-critical: rgb(239 68 68);   /* red-500 */
--priority-high: rgb(249 115 22);      /* orange-500 */
--priority-medium: rgb(234 179 8);     /* yellow-500 */
--priority-low: rgb(34 197 94);        /* green-500 */
```

### Component Styling
- **Cards**: bg-gray-800 with border-gray-700, hover:bg-gray-700
- **Buttons**: bg-gray-700 with hover:bg-gray-600
- **Inputs**: bg-gray-800 with border-gray-600, focus:border-blue-500
- **Modals**: bg-gray-800 with backdrop blur
- **Badges**: Colored backgrounds with 20% opacity for status/priority

---

## Integration Requirements

### PMaC CLI Integration
- **Command Structure**: Extend existing CLI with viewer subcommand
- **File Path Handling**: Support relative and absolute paths
- **Error Handling**: Graceful handling of missing or invalid YAML files
- **Development Mode**: Hot reload during development

### YAML Parser Integration
- **Validation**: Schema validation for project-backlog.yml format
- **Error Recovery**: Graceful handling of malformed YAML
- **Type Safety**: TypeScript interfaces for all parsed data
- **Performance**: Efficient parsing for large backlogs

---

## Deployment Architecture

### Development Environment
- **Local Server**: Vite dev server with hot module replacement
- **File Watching**: Automatic reload on YAML file changes
- **Debug Mode**: Console logging for development debugging

### Production Build
- **Static Generation**: Pre-built static assets for distribution
- **Asset Optimization**: Minified CSS and JavaScript
- **Bundle Size**: Target under 500KB compressed

### Distribution Strategy
- **NPM Integration**: Distributed as part of PMaC CLI package
- **Static Hosting**: Optional static build for web deployment
- **Local First**: Primary use case is local development

---

## Project Constraints

### Timeline Constraints
- **MVP Deadline**: 2-3 weeks for core functionality
- **Phase 1**: Basic task visualization and dark mode
- **Phase 2**: Critical path analysis and advanced features

### Technical Constraints
- **Node.js**: Minimum Node.js 18.0+ compatibility
- **Package Size**: Keep dependencies minimal for fast installation
- **Local Only**: No external API dependencies

### Resource Constraints
- **Single Developer**: Designed for solo development workflow
- **Time Budget**: 40-60 hours estimated total development time

---

## Risk Assessment

### Technical Risks
- **Risk**: Complex SVG dependency graph rendering
  - **Impact**: High - Core feature for visualization
  - **Probability**: Medium
  - **Mitigation**: Start with simple implementation, iterate on complexity

- **Risk**: YAML parsing performance with large files
  - **Impact**: Medium - Affects user experience
  - **Probability**: Low
  - **Mitigation**: Implement lazy loading and virtual scrolling

### Project Risks
- **Risk**: Scope creep with additional features
  - **Impact**: High - Could delay MVP delivery
  - **Probability**: Medium
  - **Mitigation**: Strict adherence to PMaC methodology and acceptance criteria

- **Risk**: Integration complexity with existing PMaC CLI
  - **Impact**: Medium - Affects distribution strategy
  - **Probability**: Low
  - **Mitigation**: Early integration testing and clear CLI interface design

---

## PMaC Integration Notes

This document integrates with the Project Management as Code methodology:

- **Task References**: All requirements traceable to tasks in `project-backlog.yml`
- **Decision Tracking**: Architectural decisions logged in `prompts-log.md`
- **Implementation Guidance**: Technical details guide development tasks
- **Version Control**: Document evolves with implementation

**PMaC Compliance Requirements**:
- All development must reference this technical architecture
- UI/UX decisions must align with dark mode design system
- Performance requirements must be validated before task completion
- All components must include comprehensive tests

---

_This technical requirements document serves as the authoritative source for PMaC Backlog Viewer implementation, ensuring consistent development aligned with PMaC methodology principles._