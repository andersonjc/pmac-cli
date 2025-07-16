/**
 * TypeScript interfaces for PMaC Backlog Viewer
 * Defines complete data structure for project-backlog.yml files
 */

// ===== CORE DATA STRUCTURES =====

export type TaskStatus = 'ready' | 'in_progress' | 'testing' | 'completed' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_hours: number;
  actual_hours?: number;
  assignee?: string;
  requirements: string[];
  acceptance_criteria?: string[];
  dependencies: string[];
  blocks: string[];
  notes: string[];
}

export interface Phase {
  title: string;
  description: string;
  status: string;
  estimated_duration: string;
  tasks: Task[];
}

export interface ProjectMetadata {
  project: string;
  version: string;
  last_updated: string;
  current_sprint: string;
  pmac_methodology: string;
  technical_requirements: string;
  decision_log: string;
  ai_instructions: string;
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface EpicSummary {
  total_estimated_hours: number;
  estimated_duration: string;
  critical_path: string[];
  success_criteria: {
    technical: string[];
    business: string[];
    pmac_methodology: string[];
  };
}

export interface ProjectBacklog {
  metadata: ProjectMetadata;
  phases: Record<string, Phase>;
  epic_summary?: EpicSummary;
  risks?: Record<RiskLevel, Risk[]>;
}

// ===== UI STATE MANAGEMENT TYPES =====

export interface TaskFilters {
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  phase?: string | null;
  assignee?: string | null;
  search?: string | null;
}

export interface TaskSelection {
  selectedTaskId: string | null;
  selectedPhase: string | null;
}

export interface ViewState {
  filters: TaskFilters;
  selection: TaskSelection;
  collapsedPhases: Set<string>;
  showCriticalPath: boolean;
  showDependencyGraph: boolean;
  showRiskPanel: boolean;
}

export interface AppState {
  backlog: ProjectBacklog | null;
  viewState: ViewState;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Filter state for tasks
 */
export interface FilterState {
  status: TaskStatus | null;
  priority: TaskPriority | null;
  phase: string | null;
  search: string;
  showCompleted: boolean;
}

// ===== COMPUTED/DERIVED TYPES =====

export interface TaskWithPhase extends Task {
  phase: string;
  phaseTitle: string;
  effectiveStatus?: TaskStatus; // Computed status that considers dependencies
}

export interface PhaseStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
  totalHours: number;
  completedHours: number;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  completedHours: number;
  phaseStats: Record<string, PhaseStats>;
  completionPercentage: number;
}

export interface DependencyNode {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  phase: string;
  dependencies: string[];
  blocks: string[];
  estimated_hours: number;
  isCritical?: boolean;
  x?: number;
  y?: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'dependency' | 'blocking';
  isCritical?: boolean;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
}

export interface CriticalPathNode extends DependencyNode {
  isCritical: boolean;
  longestPathLength: number;
}

// ===== YAML PARSING AND VALIDATION TYPES =====

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ParseOptions {
  validateSchema?: boolean;
  strict?: boolean;
  allowPartial?: boolean;
}

// ===== UI COMPONENT PROP TYPES =====

export interface TaskCardProps {
  task: Task;
  phase: string;
  isSelected: boolean;
  onClick: (_taskId: string) => void;
  onStatusChange?: (_taskId: string, _status: TaskStatus) => void;
}

export interface PhaseGroupProps {
  phase: Phase;
  phaseName: string;
  isCollapsed: boolean;
  onToggleCollapse: (_phaseName: string) => void;
  filters: TaskFilters;
}

export interface TaskDetailProps {
  task: Task | null;
  phase: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface CriticalPathProps {
  nodes: CriticalPathNode[];
  edges: DependencyEdge[];
  width: number;
  height: number;
  onNodeClick: (_nodeId: string) => void;
}

export interface DependencyGraphProps {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  selectedNodeId: string | null;
  onNodeSelect: (_nodeId: string | null) => void;
  onNodeDoubleClick: (_nodeId: string) => void;
}

export interface RiskPanelProps {
  risks: Record<RiskLevel, Risk[]>;
  onRiskClick: (_risk: Risk) => void;
}

export interface BacklogOverviewProps {
  stats: ProjectStats;
  metadata: ProjectMetadata;
}

// ===== UTILITY TYPES =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ===== TYPE GUARDS =====

export function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === 'string' &&
    ['ready', 'in_progress', 'testing', 'completed', 'blocked'].includes(value)
  );
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === 'string' && ['critical', 'high', 'medium', 'low'].includes(value);
}

export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === 'string' && ['high', 'medium', 'low'].includes(value);
}

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    isTaskStatus(task.status) &&
    isTaskPriority(task.priority) &&
    typeof task.estimated_hours === 'number' &&
    Array.isArray(task.requirements) &&
    Array.isArray(task.dependencies) &&
    Array.isArray(task.blocks) &&
    Array.isArray(task.notes)
  );
}

export function isPhase(value: unknown): value is Phase {
  if (!value || typeof value !== 'object') return false;

  const phase = value as Record<string, unknown>;
  return (
    typeof phase.title === 'string' &&
    typeof phase.description === 'string' &&
    typeof phase.status === 'string' &&
    typeof phase.estimated_duration === 'string' &&
    Array.isArray(phase.tasks) &&
    phase.tasks.every(isTask)
  );
}

export function isProjectBacklog(value: unknown): value is ProjectBacklog {
  if (!value || typeof value !== 'object') return false;

  const backlog = value as Record<string, unknown>;
  return (
    typeof backlog.metadata === 'object' &&
    backlog.metadata !== null &&
    typeof backlog.phases === 'object' &&
    backlog.phases !== null &&
    Object.values(backlog.phases).every(isPhase)
  );
}

// ===== CONSTANTS =====

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  ready: 'status-pending',
  in_progress: 'status-in-progress',
  testing: 'status-in-progress',
  completed: 'status-completed',
  blocked: 'status-blocked',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  high: 'text-red-400 border-red-500/20',
  medium: 'text-yellow-400 border-yellow-500/20',
  low: 'text-green-400 border-green-500/20',
};

export const DEFAULT_FILTERS: TaskFilters = {
  status: null,
  priority: null,
  phase: null,
  assignee: null,
  search: null,
};

export const DEFAULT_VIEW_STATE: ViewState = {
  filters: DEFAULT_FILTERS,
  selection: {
    selectedTaskId: null,
    selectedPhase: null,
  },
  collapsedPhases: new Set(),
  showCriticalPath: false,
  showDependencyGraph: false,
  showRiskPanel: false,
};

export const DEFAULT_APP_STATE: AppState = {
  backlog: null,
  viewState: DEFAULT_VIEW_STATE,
  isLoading: false,
  error: null,
  lastUpdated: null,
};
