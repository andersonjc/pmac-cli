/**
 * PMaC Backlog YAML Parser with Validation
 * Handles parsing, validation, and transformation of project-backlog.yml files
 */

import { parse as parseYaml } from 'yaml';
import type {
  ProjectBacklog,
  ProjectMetadata,
  EpicSummary,
  Risk,
  RiskLevel,
  ParseResult,
  ValidationError,
  ParseOptions,
  Task,
  TaskWithPhase,
  ProjectStats,
  PhaseStats,
  DependencyNode,
  DependencyEdge,
  CriticalPathNode,
} from './types';

import { isTaskStatus, isTaskPriority, isRiskLevel } from './types';

// ===== YAML PARSING FUNCTIONS =====

/**
 * Parse a YAML string into a ProjectBacklog object
 */
export function parseBacklogYaml(
  yamlContent: string,
  options: ParseOptions = {}
): ParseResult<ProjectBacklog> {
  const { validateSchema = true, strict = true, allowPartial = false } = options;

  try {
    // Parse YAML content
    const rawData = parseYaml(yamlContent);

    if (!rawData || typeof rawData !== 'object') {
      return {
        success: false,
        error: 'Invalid YAML: Root must be an object',
      };
    }

    // Validate schema if requested
    if (validateSchema) {
      const validationResult = validateBacklogSchema(rawData, { strict, allowPartial });
      if (!validationResult.success) {
        return {
          success: false,
          error: `Schema validation failed: ${validationResult.error}`,
          warnings: validationResult.warnings,
        };
      }
    }

    // Transform to typed object
    const backlog = transformRawData(rawData);

    return {
      success: true,
      data: backlog,
      warnings: [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    };
  }
}

/**
 * Parse a project-backlog.yml file from a file path
 */
export async function parseBacklogFile(
  filePath: string,
  _options: ParseOptions = {}
): Promise<ParseResult<ProjectBacklog>> {
  try {
    // Resolve file path (for future implementation)
    resolveFilePath(filePath);

    // For now, return a mock result since we can't access filesystem directly in browser
    // In a real implementation, this would read the file
    return {
      success: false,
      error:
        'File system access not available in browser environment. Use parseBacklogYaml() with YAML content instead.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'File parsing error',
    };
  }
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate a raw object against the ProjectBacklog schema
 */
export function validateBacklogSchema(
  data: any,
  options: { strict?: boolean; allowPartial?: boolean } = {}
): ParseResult<void> {
  const { strict = true, allowPartial = false } = options;
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Check required top-level fields
  if (!data.metadata) {
    errors.push({ field: 'metadata', message: 'Missing required metadata field' });
  } else {
    const metadataErrors = validateMetadata(data.metadata, strict);
    errors.push(...metadataErrors);
  }

  if (!data.phases) {
    errors.push({ field: 'phases', message: 'Missing required phases field' });
  } else if (typeof data.phases !== 'object') {
    errors.push({ field: 'phases', message: 'Phases must be an object' });
  } else {
    const phaseErrors = validatePhases(data.phases, strict);
    errors.push(...phaseErrors);
  }

  // Optional fields validation
  if (data.epic_summary) {
    const epicErrors = validateEpicSummary(data.epic_summary, strict);
    errors.push(...epicErrors);
  }

  if (data.risks) {
    const riskErrors = validateRisks(data.risks, strict);
    errors.push(...riskErrors);
  }

  // Check for unknown fields if strict mode
  if (strict) {
    const knownFields = ['metadata', 'phases', 'epic_summary', 'risks'];
    const unknownFields = Object.keys(data).filter(key => !knownFields.includes(key));
    for (const field of unknownFields) {
      warnings.push(`Unknown field: ${field}`);
    }
  }

  if (errors.length > 0 && !allowPartial) {
    return {
      success: false,
      error: `Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
      warnings,
    };
  }

  return {
    success: true,
    warnings,
  };
}

/**
 * Validate metadata section
 */
function validateMetadata(metadata: any, _strict: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof metadata !== 'object' || metadata === null) {
    errors.push({ field: 'metadata', message: 'Metadata must be an object' });
    return errors;
  }

  const requiredFields = ['project', 'version', 'last_updated'];
  for (const field of requiredFields) {
    if (!metadata[field]) {
      errors.push({ field: `metadata.${field}`, message: `Missing required field: ${field}` });
    } else if (typeof metadata[field] !== 'string') {
      errors.push({ field: `metadata.${field}`, message: `Field ${field} must be a string` });
    }
  }

  return errors;
}

/**
 * Validate phases section
 */
function validatePhases(phases: any, strict: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!phases || typeof phases !== 'object') {
    errors.push({ field: 'phases', message: 'Phases must be an object' });
    return errors;
  }

  for (const [phaseName, phase] of Object.entries(phases)) {
    const phaseErrors = validatePhase(phase, `phases.${phaseName}`, strict);
    errors.push(...phaseErrors);
  }

  return errors;
}

/**
 * Validate individual phase
 */
function validatePhase(phase: any, fieldPath: string, strict: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!phase || typeof phase !== 'object') {
    errors.push({ field: fieldPath, message: 'Phase must be an object' });
    return errors;
  }

  const requiredFields = ['title', 'description', 'status', 'estimated_duration', 'tasks'];
  for (const field of requiredFields) {
    if (!phase[field]) {
      errors.push({ field: `${fieldPath}.${field}`, message: `Missing required field: ${field}` });
    }
  }

  if (phase.tasks && Array.isArray(phase.tasks)) {
    for (let i = 0; i < phase.tasks.length; i++) {
      const taskErrors = validateTask(phase.tasks[i], `${fieldPath}.tasks[${i}]`, strict);
      errors.push(...taskErrors);
    }
  } else if (phase.tasks) {
    errors.push({ field: `${fieldPath}.tasks`, message: 'Tasks must be an array' });
  }

  return errors;
}

/**
 * Validate individual task
 */
function validateTask(task: any, fieldPath: string, _strict: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!task || typeof task !== 'object') {
    errors.push({ field: fieldPath, message: 'Task must be an object' });
    return errors;
  }

  const requiredFields = [
    'id',
    'title',
    'status',
    'priority',
    'estimated_hours',
    'requirements',
    'dependencies',
    'blocks',
    'notes',
  ];
  for (const field of requiredFields) {
    if (task[field] === undefined) {
      errors.push({ field: `${fieldPath}.${field}`, message: `Missing required field: ${field}` });
    }
  }

  // Validate specific field types
  if (task.status && !isTaskStatus(task.status)) {
    errors.push({ field: `${fieldPath}.status`, message: `Invalid status: ${task.status}` });
  }

  if (task.priority && !isTaskPriority(task.priority)) {
    errors.push({ field: `${fieldPath}.priority`, message: `Invalid priority: ${task.priority}` });
  }

  if (task.estimated_hours && typeof task.estimated_hours !== 'number') {
    errors.push({
      field: `${fieldPath}.estimated_hours`,
      message: 'Estimated hours must be a number',
    });
  }

  const arrayFields = ['requirements', 'acceptance_criteria', 'dependencies', 'blocks', 'notes'];
  for (const field of arrayFields) {
    if (task[field] && !Array.isArray(task[field])) {
      errors.push({ field: `${fieldPath}.${field}`, message: `${field} must be an array` });
    }
  }

  return errors;
}

/**
 * Validate epic summary section
 */
function validateEpicSummary(epicSummary: any, _strict: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!epicSummary || typeof epicSummary !== 'object') {
    errors.push({ field: 'epic_summary', message: 'Epic summary must be an object' });
    return errors;
  }

  if (epicSummary.total_estimated_hours && typeof epicSummary.total_estimated_hours !== 'number') {
    errors.push({
      field: 'epic_summary.total_estimated_hours',
      message: 'Total estimated hours must be a number',
    });
  }

  return errors;
}

/**
 * Validate risks section
 */
function validateRisks(risks: any, _strict: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!risks || typeof risks !== 'object') {
    errors.push({ field: 'risks', message: 'Risks must be an object' });
    return errors;
  }

  for (const [level, riskList] of Object.entries(risks)) {
    if (!isRiskLevel(level)) {
      errors.push({ field: `risks.${level}`, message: `Invalid risk level: ${level}` });
      continue;
    }

    if (!Array.isArray(riskList)) {
      errors.push({ field: `risks.${level}`, message: `Risk level ${level} must be an array` });
      continue;
    }

    for (let i = 0; i < riskList.length; i++) {
      const risk = riskList[i];
      if (!risk || typeof risk !== 'object') {
        errors.push({ field: `risks.${level}[${i}]`, message: 'Risk must be an object' });
        continue;
      }

      if (!risk.risk || typeof risk.risk !== 'string') {
        errors.push({
          field: `risks.${level}[${i}].risk`,
          message: 'Risk description must be a string',
        });
      }

      if (!risk.mitigation || typeof risk.mitigation !== 'string') {
        errors.push({
          field: `risks.${level}[${i}].mitigation`,
          message: 'Risk mitigation must be a string',
        });
      }
    }
  }

  return errors;
}

// ===== FILE PATH RESOLUTION =====

/**
 * Resolve file path to absolute path
 */
export function resolveFilePath(filePath: string): string {
  // Handle various path formats
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath; // URL
  }

  if (filePath.startsWith('/')) {
    return filePath; // Absolute path
  }

  // Relative path - resolve relative to current working directory
  // In browser environment, this would need to be handled differently
  return filePath;
}

// ===== DATA TRANSFORMATION =====

/**
 * Transform raw parsed data into typed ProjectBacklog
 */
function transformRawData(rawData: any): ProjectBacklog {
  const backlog: ProjectBacklog = {
    metadata: rawData.metadata as ProjectMetadata,
    phases: {},
  };

  // Transform phases
  for (const [phaseName, phaseData] of Object.entries(rawData.phases)) {
    const phase = phaseData as any;
    backlog.phases[phaseName] = {
      title: phase.title,
      description: phase.description,
      status: phase.status,
      estimated_duration: phase.estimated_duration,
      tasks: phase.tasks || [],
    };
  }

  // Transform optional fields
  if (rawData.epic_summary) {
    backlog.epic_summary = rawData.epic_summary as EpicSummary;
  }

  if (rawData.risks) {
    backlog.risks = rawData.risks as Record<RiskLevel, Risk[]>;
  }

  return backlog;
}

/**
 * Transform backlog data for UI consumption
 */
export function transformForUI(backlog: ProjectBacklog): {
  tasksWithPhase: TaskWithPhase[];
  stats: ProjectStats;
  dependencyNodes: DependencyNode[];
  dependencyEdges: DependencyEdge[];
} {
  const tasksWithPhase: TaskWithPhase[] = [];
  const phaseStats: Record<string, PhaseStats> = {};
  const dependencyNodes: DependencyNode[] = [];
  const dependencyEdges: DependencyEdge[] = [];

  let totalTasks = 0;
  let completedTasks = 0;
  let totalHours = 0;
  let completedHours = 0;

  // Process phases and tasks
  for (const [phaseName, phase] of Object.entries(backlog.phases)) {
    const stats: PhaseStats = {
      total: phase.tasks.length,
      completed: 0,
      inProgress: 0,
      pending: 0,
      blocked: 0,
      totalHours: 0,
      completedHours: 0,
    };

    for (const task of phase.tasks) {
      // Create task with phase info
      const taskWithPhase: TaskWithPhase = {
        ...(task as Task),
        phase: phaseName,
        phaseTitle: phase.title,
      };
      tasksWithPhase.push(taskWithPhase);

      // Update statistics
      totalTasks++;
      totalHours += task.estimated_hours;
      stats.totalHours += task.estimated_hours;

      if (task.status === 'completed') {
        completedTasks++;
        completedHours += task.estimated_hours;
        stats.completed++;
        stats.completedHours += task.estimated_hours;
      } else if (task.status === 'in_progress' || task.status === 'testing') {
        stats.inProgress++;
      } else if (task.status === 'blocked') {
        stats.blocked++;
      } else {
        stats.pending++;
      }

      // Create dependency node
      const node: DependencyNode = {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        phase: phaseName,
        dependencies: task.dependencies,
        blocks: task.blocks,
        estimated_hours: task.estimated_hours,
      };
      dependencyNodes.push(node);

      // Create dependency edges
      for (const depId of task.dependencies) {
        dependencyEdges.push({
          from: depId,
          to: task.id,
          type: 'dependency',
        });
      }

      for (const blockId of task.blocks) {
        dependencyEdges.push({
          from: task.id,
          to: blockId,
          type: 'blocking',
        });
      }
    }

    phaseStats[phaseName] = stats;
  }

  const stats: ProjectStats = {
    totalTasks,
    completedTasks,
    totalHours,
    completedHours,
    phaseStats,
    completionPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
  };

  return {
    tasksWithPhase,
    stats,
    dependencyNodes,
    dependencyEdges,
  };
}

/**
 * Calculate critical path through tasks
 */
export function calculateCriticalPath(nodes: DependencyNode[]): CriticalPathNode[] {
  const nodeMap = new Map<string, DependencyNode>();
  const criticalNodes: CriticalPathNode[] = [];

  // Build node map
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Calculate longest path for each node
  for (const node of nodes) {
    const pathLength = calculateLongestPath(node.id, nodeMap, new Set());
    const criticalNode: CriticalPathNode = {
      ...node,
      isCritical: false,
      longestPathLength: pathLength,
    };
    criticalNodes.push(criticalNode);
  }

  // Find maximum path length
  const maxPathLength = Math.max(...criticalNodes.map(n => n.longestPathLength));

  // Mark critical nodes
  for (const node of criticalNodes) {
    if (node.longestPathLength === maxPathLength) {
      node.isCritical = true;
    }
  }

  return criticalNodes;
}

/**
 * Calculate longest path from a node
 */
function calculateLongestPath(
  nodeId: string,
  nodeMap: Map<string, DependencyNode>,
  visited: Set<string>
): number {
  if (visited.has(nodeId)) {
    return 0; // Prevent infinite loops
  }

  const node = nodeMap.get(nodeId);
  if (!node) {
    return 0;
  }

  visited.add(nodeId);

  let maxPath = 1; // Current node counts as 1

  // Check all nodes that this node blocks
  for (const blockId of node.blocks) {
    const subPath = calculateLongestPath(blockId, nodeMap, new Set(visited));
    maxPath = Math.max(maxPath, 1 + subPath);
  }

  visited.delete(nodeId);

  return maxPath;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: string): string {
  if (error.includes('YAMLParseError')) {
    return 'Invalid YAML format. Please check your project-backlog.yml file for syntax errors.';
  }

  if (error.includes('Schema validation failed')) {
    return `The project-backlog.yml file doesn't match the expected format. ${error}`;
  }

  if (error.includes('File system access')) {
    return 'Cannot read files in browser environment. Please paste the YAML content directly.';
  }

  return error;
}

/**
 * Check if YAML content appears to be a valid PMaC backlog
 */
export function isValidBacklogYaml(yamlContent: string): boolean {
  try {
    const result = parseBacklogYaml(yamlContent, { validateSchema: true, strict: false });
    return result.success;
  } catch {
    return false;
  }
}
