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
  DEFAULT_APP_STATE
} from './types';

// ===== MAIN APPLICATION STATE =====

/**
 * Main application state store
 */
export const appState = writable<AppState>({
  isLoading: false,
  backlog: null,
  error: null,
  lastUpdated: null,
  viewState: {
    selectedPhase: null,
    selectedTask: null,
    showTaskDetails: false,
    showPhaseDetails: false,
    showDependencyGraph: false,
    showRiskPanel: false
  }
});

/**
 * Project title derived from backlog
 */
export const projectTitle = derived(
  appState,
  ($appState) => $appState.backlog?.metadata.project || 'PMaC Backlog Viewer'
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
  showCompleted: true
});

/**
 * Selected task for detail view
 */
export const selectedTask = writable<string | null>(null);

/**
 * Current active phase
 */
export const activePhase = writable<string | null>(null);

// ===== DERIVED STORES =====

/**
 * All tasks with phase information
 */
export const allTasks = derived(
  appState,
  ($appState) => {
    if (!$appState.backlog) return [];
    
    const tasks: TaskWithPhase[] = [];
    
    for (const [phaseName, phase] of Object.entries($appState.backlog.phases)) {
      for (const task of phase.tasks) {
        tasks.push({
          ...task,
          phase: phaseName,
          phaseTitle: phase.title
        });
      }
    }
    
    return tasks;
  }
);

/**
 * Filtered tasks based on current filter state
 */
export const filteredTasks = derived(
  [allTasks, filterState],
  ([$allTasks, $filterState]) => {
    let filtered = $allTasks;
    
    // Filter by status
    if ($filterState.status) {
      filtered = filtered.filter(task => task.status === $filterState.status);
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
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.id.toLowerCase().includes(searchTerm) ||
        task.requirements.some(req => req.toLowerCase().includes(searchTerm)) ||
        (task.acceptance_criteria && task.acceptance_criteria.some(criteria => criteria.toLowerCase().includes(searchTerm)))
      );
    }
    
    // Filter completed tasks if disabled
    if (!$filterState.showCompleted) {
      filtered = filtered.filter(task => task.status !== 'completed');
    }
    
    return filtered;
  }
);

/**
 * Project statistics
 */
export const projectStats = derived(
  allTasks,
  ($allTasks) => {
    const stats: ProjectStats = {
      totalTasks: $allTasks.length,
      completedTasks: 0,
      totalHours: 0,
      completedHours: 0,
      phaseStats: {},
      completionPercentage: 0
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
        completedHours: 0
      };
      
      for (const task of tasks) {
        phaseStats.totalHours += task.estimated_hours;
        stats.totalHours += task.estimated_hours;
        
        if (task.status === 'completed') {
          phaseStats.completed++;
          stats.completedTasks++;
          phaseStats.completedHours += task.estimated_hours;
          stats.completedHours += task.estimated_hours;
        } else if (task.status === 'in_progress' || task.status === 'testing') {
          phaseStats.inProgress++;
        } else if (task.status === 'blocked') {
          phaseStats.blocked++;
        } else {
          phaseStats.pending++;
        }
      }
      
      stats.phaseStats[phaseName] = phaseStats;
    }
    
    stats.completionPercentage = stats.totalTasks > 0 
      ? (stats.completedTasks / stats.totalTasks) * 100 
      : 0;
    
    return stats;
  }
);

/**
 * Available filter options
 */
export const filterOptions = derived(
  [allTasks, appState],
  ([$allTasks, $appState]) => {
    const statuses = new Set<TaskStatus>();
    const priorities = new Set<TaskPriority>();
    const phases = new Set<string>();
    
    for (const task of $allTasks) {
      statuses.add(task.status);
      priorities.add(task.priority);
      phases.add(task.phase);
    }
    
    return {
      statuses: Array.from(statuses),
      priorities: Array.from(priorities),
      phases: Array.from(phases),
      phaseLabels: $appState.backlog ? 
        Object.fromEntries(
          Object.entries($appState.backlog.phases).map(([key, phase]) => [key, phase.title])
        ) : {}
    };
  }
);

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
  defaultView: 'phases' as 'phases' | 'list' | 'board'
});

// ===== STORE ACTIONS =====

/**
 * Load backlog data into the store
 */
export function loadBacklog(backlog: ProjectBacklog) {
  appState.update(state => ({
    ...state,
    backlog,
    error: null,
    lastUpdated: new Date().toISOString()
  }));
}

/**
 * Set loading state
 */
export function setLoading(isLoading: boolean) {
  appState.update(state => ({
    ...state,
    isLoading
  }));
}

/**
 * Set error state
 */
export function setError(error: string | null) {
  appState.update(state => ({
    ...state,
    error
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
    showCompleted: true
  });
}

/**
 * Set filter by status
 */
export function setStatusFilter(status: TaskStatus | null) {
  filterState.update(state => ({
    ...state,
    status
  }));
}

/**
 * Set filter by priority
 */
export function setPriorityFilter(priority: TaskPriority | null) {
  filterState.update(state => ({
    ...state,
    priority
  }));
}

/**
 * Set filter by phase
 */
export function setPhaseFilter(phase: string | null) {
  filterState.update(state => ({
    ...state,
    phase
  }));
}

/**
 * Set search filter
 */
export function setSearchFilter(search: string) {
  filterState.update(state => ({
    ...state,
    search
  }));
}

/**
 * Toggle completed tasks visibility
 */
export function toggleCompletedTasks() {
  filterState.update(state => ({
    ...state,
    showCompleted: !state.showCompleted
  }));
}

/**
 * Select a task for detail view
 */
export function selectTask(taskId: string | null) {
  selectedTask.set(taskId);
}

/**
 * Set active phase
 */
export function setActivePhase(phase: string | null) {
  activePhase.set(phase);
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
    userPreferences.subscribe(preferences => {
      localStorage.setItem('pmac-viewer-preferences', JSON.stringify(preferences));
    });
  }
}

// ===== UTILITY STORES =====

/**
 * Current timestamp for reactive updates
 */
export const currentTime = readable(new Date(), (set) => {
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
  ($appState) => !$appState.isLoading && $appState.backlog !== null
);