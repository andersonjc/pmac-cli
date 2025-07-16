/**
 * Svelte Stores for PMaC Backlog Viewer State Management
 * Manages application state, filtering, and user preferences
 */

import { writable, derived, readable } from 'svelte/store';
import type {
  ProjectBacklog,
  TaskWithPhase,
  TaskStatus,
  TaskPriority,
  ProjectStats,
  FilterState,
  AppState,
  Task,
} from './types';

// ===== MAIN APPLICATION STATE =====

/**
 * Main application state store
 */
export const appState = writable<AppState>({
  isLoading: true,
  backlog: null,
  error: null,
  lastUpdated: null,
  viewState: {
    filters: {
      status: null,
      priority: null,
      phase: null,
      assignee: null,
      search: null,
    },
    selection: {
      selectedTaskId: null,
      selectedPhase: null,
    },
    collapsedPhases: new Set<string>(),
    showCriticalPath: false,
    showDependencyGraph: false,
    showRiskPanel: false,
  },
});

/**
 * Project title derived from backlog
 */
export const projectTitle = derived(
  appState,
  $appState => $appState.backlog?.metadata.project || 'PMaC Backlog Viewer'
);

// ===== FILTER STORES =====

/**
 * Filter state for tasks
 */
export const filterState = writable<FilterState>({
  status: null,
  priority: null,
  phase: null,
  search: '',
  showCompleted: true,
});

/**
 * Selected task for detail view
 */
export const selectedTask = writable<TaskWithPhase | null>(null);

/**
 * Task detail modal state
 */
export const isTaskDetailOpen = writable<boolean>(false);

/**
 * Current active phase
 */
export const activePhase = writable<string | null>(null);

/**
 * Collapsed phases state
 */
export const collapsedPhases = writable<Set<string>>(new Set());

// ===== DERIVED STORES =====

/**
 * Determine if a task is effectively blocked by incomplete dependencies
 */
function isTaskEffectivelyBlocked(task: Task, allTasks: TaskWithPhase[]): boolean {
  // If task is already marked as blocked, respect that
  if (task.status === 'blocked') return true;
  
  // If task is completed or in progress, it's not blocked
  if (task.status === 'completed' || task.status === 'in_progress' || task.status === 'testing') {
    return false;
  }
  
  // Check if any dependencies are not completed
  for (const depId of task.dependencies) {
    const dependency = allTasks.find(t => t.id === depId);
    if (!dependency || dependency.status !== 'completed') {
      return true;
    }
  }
  
  return false;
}

/**
 * Get effective status for a task (considering dependencies)
 */
function getEffectiveStatus(task: Task, allTasks: TaskWithPhase[]): TaskStatus {
  if (isTaskEffectivelyBlocked(task, allTasks)) {
    return 'blocked';
  }
  return task.status;
}

/**
 * All tasks with phase information and effective status
 */
export const allTasks = derived(appState, $appState => {
  if (!$appState.backlog) return [];

  const tasks: TaskWithPhase[] = [];

  // First pass: collect all tasks
  for (const [phaseName, phase] of Object.entries($appState.backlog.phases)) {
    for (const task of phase.tasks) {
      tasks.push({
        ...task,
        phase: phaseName,
        phaseTitle: phase.title,
      });
    }
  }

  // Second pass: compute effective status for each task
  for (const task of tasks) {
    task.effectiveStatus = getEffectiveStatus(task, tasks);
  }

  return tasks;
});

/**
 * Filtered tasks based on current filter state
 */
export const filteredTasks = derived([allTasks, filterState], ([$allTasks, $filterState]) => {
  let filtered = $allTasks;

  // Filter by status (using effective status)
  if ($filterState.status) {
    filtered = filtered.filter(task => (task.effectiveStatus || task.status) === $filterState.status);
  }

  // Filter by priority
  if ($filterState.priority) {
    filtered = filtered.filter(task => task.priority === $filterState.priority);
  }

  // Filter by phase
  if ($filterState.phase) {
    filtered = filtered.filter(task => task.phase === $filterState.phase);
  }

  // Filter by search
  if ($filterState.search) {
    const searchTerm = $filterState.search.toLowerCase();
    filtered = filtered.filter(
      task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.id.toLowerCase().includes(searchTerm) ||
        task.requirements.some(req => req.toLowerCase().includes(searchTerm)) ||
        (task.acceptance_criteria &&
          task.acceptance_criteria.some(criteria => criteria.toLowerCase().includes(searchTerm)))
    );
  }

  // Filter completed tasks if disabled
  if (!$filterState.showCompleted) {
    filtered = filtered.filter(task => task.status !== 'completed');
  }

  return filtered;
});

/**
 * Project statistics
 */
export const projectStats = derived(allTasks, $allTasks => {
  const stats: ProjectStats = {
    totalTasks: $allTasks.length,
    completedTasks: 0,
    totalHours: 0,
    completedHours: 0,
    phaseStats: {},
    completionPercentage: 0,
  };

  // Calculate phase statistics
  const phaseGroups = new Map<string, TaskWithPhase[]>();

  for (const task of $allTasks) {
    if (!phaseGroups.has(task.phase)) {
      phaseGroups.set(task.phase, []);
    }
    phaseGroups.get(task.phase)!.push(task);
  }

  for (const [phaseName, tasks] of phaseGroups) {
    const phaseStats = {
      total: tasks.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      blocked: 0,
      totalHours: 0,
      completedHours: 0,
    };

    for (const task of tasks) {
      phaseStats.totalHours += task.estimated_hours;
      stats.totalHours += task.estimated_hours;

      // Use effective status for statistics
      const effectiveStatus = task.effectiveStatus || task.status;
      
      if (effectiveStatus === 'completed') {
        phaseStats.completed++;
        stats.completedTasks++;
        phaseStats.completedHours += task.estimated_hours;
        stats.completedHours += task.estimated_hours;
      } else if (effectiveStatus === 'in_progress' || effectiveStatus === 'testing') {
        phaseStats.inProgress++;
      } else if (effectiveStatus === 'blocked') {
        phaseStats.blocked++;
      } else {
        phaseStats.pending++;
      }
    }

    stats.phaseStats[phaseName] = phaseStats;
  }

  stats.completionPercentage =
    stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  return stats;
});

/**
 * Available filter options
 */
export const filterOptions = derived([allTasks, appState], ([$allTasks, $appState]) => {
  const statuses = new Set<TaskStatus>();
  const priorities = new Set<TaskPriority>();
  const phases = new Set<string>();

  for (const task of $allTasks) {
    // Use effective status for filter options
    const effectiveStatus = task.effectiveStatus || task.status;
    statuses.add(effectiveStatus);
    priorities.add(task.priority);
    phases.add(task.phase);
  }

  return {
    statuses: Array.from(statuses),
    priorities: Array.from(priorities),
    phases: Array.from(phases),
    phaseLabels: $appState.backlog
      ? Object.fromEntries(
          Object.entries($appState.backlog.phases).map(([key, phase]) => [key, phase.title])
        )
      : {},
  };
});

/**
 * Tasks grouped by phase with filtered tasks
 */
export const tasksByPhase = derived([filteredTasks, appState], ([$filteredTasks, $appState]) => {
  if (!$appState.backlog) return new Map();

  const phaseGroups = new Map<string, TaskWithPhase[]>();

  // Initialize all phases (even if they have no filtered tasks)
  for (const phaseId of Object.keys($appState.backlog.phases)) {
    phaseGroups.set(phaseId, []);
  }

  // Group filtered tasks by phase
  for (const task of $filteredTasks) {
    const existing = phaseGroups.get(task.phase) || [];
    existing.push(task);
    phaseGroups.set(task.phase, existing);
  }

  return phaseGroups;
});

// ===== USER PREFERENCES =====

/**
 * User preferences store with persistence
 */
export const userPreferences = writable({
  theme: 'dark',
  showTaskIds: true,
  showEstimatedHours: true,
  showProgress: true,
  autoRefresh: false,
  refreshInterval: 30000, // 30 seconds
  defaultView: 'phases' as 'phases' | 'list' | 'board',
  collapsedPhases: [] as string[], // Persisted collapsed phase IDs
});

// ===== STORE ACTIONS =====

/**
 * Load backlog data into the store
 */
export function loadBacklog(backlog: ProjectBacklog) {
  appState.update(state => {
    // Only update if backlog actually changed to prevent unnecessary re-renders
    const newBacklogStr = JSON.stringify(backlog);
    const currentBacklogStr = state.backlog ? JSON.stringify(state.backlog) : null;
    
    if (newBacklogStr === currentBacklogStr) {
      // Data hasn't changed, just update timestamp without triggering re-render
      return {
        ...state,
        lastUpdated: new Date().toISOString(),
      };
    }
    
    return {
      ...state,
      backlog,
      error: null,
      lastUpdated: new Date().toISOString(),
    };
  });
}

/**
 * Set loading state
 */
export function setLoading(isLoading: boolean) {
  appState.update(state => ({
    ...state,
    isLoading,
  }));
}

/**
 * Set error state
 */
export function setError(error: string | null) {
  appState.update(state => ({
    ...state,
    error,
  }));
}

/**
 * Clear all filters
 */
export function clearFilters() {
  filterState.set({
    status: null,
    priority: null,
    phase: null,
    search: '',
    showCompleted: true,
  });
}

/**
 * Set filter by status
 */
export function setStatusFilter(status: TaskStatus | null) {
  filterState.update(state => ({
    ...state,
    status,
  }));
}

/**
 * Set filter by priority
 */
export function setPriorityFilter(priority: TaskPriority | null) {
  filterState.update(state => ({
    ...state,
    priority,
  }));
}

/**
 * Set filter by phase
 */
export function setPhaseFilter(phase: string | null) {
  filterState.update(state => ({
    ...state,
    phase,
  }));
}

/**
 * Set search filter
 */
export function setSearchFilter(search: string) {
  filterState.update(state => ({
    ...state,
    search,
  }));
}

/**
 * Toggle completed tasks visibility
 */
export function toggleCompletedTasks() {
  filterState.update(state => ({
    ...state,
    showCompleted: !state.showCompleted,
  }));
}

/**
 * Open task detail modal with specific task
 */
export function openTaskDetail(task: TaskWithPhase) {
  selectedTask.set(task);
  isTaskDetailOpen.set(true);
}

/**
 * Close task detail modal
 */
export function closeTaskDetail() {
  isTaskDetailOpen.set(false);
  selectedTask.set(null);
}

/**
 * Set active phase
 */
export function setActivePhase(phase: string | null) {
  activePhase.set(phase);
}

/**
 * Toggle phase collapse state
 */
export function togglePhaseCollapse(phaseId: string) {
  collapsedPhases.update(collapsed => {
    const newCollapsed = new Set(collapsed);
    if (newCollapsed.has(phaseId)) {
      newCollapsed.delete(phaseId);
    } else {
      newCollapsed.add(phaseId);
    }
    return newCollapsed;
  });
}

// ===== PERSISTENCE =====

/**
 * Load user preferences from localStorage
 */
export function loadUserPreferences() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pmac-viewer-preferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        userPreferences.set(preferences);

        // Sync collapsed phases from preferences
        if (preferences.collapsedPhases) {
          collapsedPhases.set(new Set(preferences.collapsedPhases));
        }
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      }
    }
  }
}

/**
 * Save user preferences to localStorage
 */
export function saveUserPreferences() {
  if (typeof window !== 'undefined') {
    // Save preferences when they change
    userPreferences.subscribe(preferences => {
      localStorage.setItem('pmac-viewer-preferences', JSON.stringify(preferences));
    });

    // Sync collapsed phases to preferences when they change
    collapsedPhases.subscribe(collapsed => {
      userPreferences.update(prefs => ({
        ...prefs,
        collapsedPhases: Array.from(collapsed),
      }));
    });
  }
}

// ===== UTILITY STORES =====

/**
 * Current timestamp for reactive updates
 */
export const currentTime = readable(new Date(), set => {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  return () => clearInterval(interval);
});

/**
 * Application ready state
 */
export const isReady = derived(
  appState,
  $appState => !$appState.isLoading && $appState.backlog !== null
);
