import { describe, it, expect } from 'vitest';
import type {
  Task,
  Phase,
  ProjectBacklog,
  TaskFilters,
  ProjectStats,
  TaskStatus,
  TaskPriority,
} from './types';

import {
  isTask,
  isPhase,
  isProjectBacklog,
  isTaskStatus,
  isTaskPriority,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
  DEFAULT_FILTERS,
} from './types';

// Test data conforming to types
const testTask: Task = {
  id: 'TEST-001',
  title: 'Test Task',
  status: 'in_progress',
  priority: 'high',
  estimated_hours: 4,
  actual_hours: 2,
  assignee: 'developer',
  requirements: ['Requirement 1', 'Requirement 2'],
  acceptance_criteria: ['Criteria 1', 'Criteria 2'],
  dependencies: ['DEP-001'],
  blocks: ['BLOCK-001'],
  notes: ['Note 1', 'Note 2'],
};

const testPhase: Phase = {
  title: 'Test Phase',
  description: 'Test phase description',
  status: 'ready',
  estimated_duration: '1 week',
  tasks: [testTask],
};

const testBacklog: ProjectBacklog = {
  metadata: {
    project: 'Test Project',
    version: '1.0.0',
    last_updated: '2024-01-01',
    current_sprint: 'test',
    pmac_methodology: 'project-management-as-code.md',
    technical_requirements: 'requirements.md',
    decision_log: 'prompts-log.md',
    ai_instructions: 'CLAUDE.md',
  },
  phases: {
    test: testPhase,
  },
};

const testFilters: TaskFilters = {
  status: 'completed',
  priority: 'high',
  phase: 'development',
  assignee: 'developer',
  search: 'test',
};

describe('PMaC Types', () => {
  describe('Type Guards', () => {
    it('should validate task status correctly', () => {
      expect(isTaskStatus('completed')).toBe(true);
      expect(isTaskStatus('in_progress')).toBe(true);
      expect(isTaskStatus('ready')).toBe(true);
      expect(isTaskStatus('testing')).toBe(true);
      expect(isTaskStatus('invalid')).toBe(false);
      expect(isTaskStatus('')).toBe(false);
      expect(isTaskStatus(null)).toBe(false);
    });

    it('should validate task priority correctly', () => {
      expect(isTaskPriority('critical')).toBe(true);
      expect(isTaskPriority('high')).toBe(true);
      expect(isTaskPriority('medium')).toBe(true);
      expect(isTaskPriority('low')).toBe(true);
      expect(isTaskPriority('invalid')).toBe(false);
      expect(isTaskPriority('')).toBe(false);
      expect(isTaskPriority(null)).toBe(false);
    });

    it('should validate task objects correctly', () => {
      expect(isTask(testTask)).toBe(true);
      expect(isTask(null)).toBe(false);
      expect(isTask({})).toBe(false);
      expect(isTask({ id: 'TEST-001' })).toBe(false); // Missing required fields
    });

    it('should validate phase objects correctly', () => {
      expect(isPhase(testPhase)).toBe(true);
      expect(isPhase({})).toBe(false);
      expect(isPhase(null)).toBe(false);
      expect(isPhase({ title: 'Test' })).toBe(false); // Missing required fields
    });

    it('should validate project backlog objects correctly', () => {
      expect(isProjectBacklog(testBacklog)).toBe(true);
      expect(isProjectBacklog(null)).toBe(false);
      expect(isProjectBacklog({})).toBe(false);
      expect(isProjectBacklog({ metadata: {} })).toBe(false); // Missing phases
    });
  });

  describe('Constants', () => {
    it('should have correct status color mappings', () => {
      expect(TASK_STATUS_COLORS.completed).toBe('status-completed');
      expect(TASK_STATUS_COLORS.in_progress).toBe('status-in-progress');
      expect(TASK_STATUS_COLORS.ready).toBe('status-pending');
      expect(TASK_STATUS_COLORS.testing).toBe('status-in-progress');
      expect(TASK_STATUS_COLORS.blocked).toBe('status-blocked');
    });

    it('should have correct priority color mappings', () => {
      expect(TASK_PRIORITY_COLORS.critical).toBe('priority-critical');
      expect(TASK_PRIORITY_COLORS.high).toBe('priority-high');
      expect(TASK_PRIORITY_COLORS.medium).toBe('priority-medium');
      expect(TASK_PRIORITY_COLORS.low).toBe('priority-low');
    });

    it('should have correct default filters', () => {
      expect(DEFAULT_FILTERS.status).toBe(null);
      expect(DEFAULT_FILTERS.priority).toBe(null);
      expect(DEFAULT_FILTERS.phase).toBe(null);
      expect(DEFAULT_FILTERS.assignee).toBe(null);
      expect(DEFAULT_FILTERS.search).toBe(null);
    });
  });

  describe('Type Inference', () => {
    it('should properly infer task types', () => {
      const task = testTask;
      const status: TaskStatus = task.status;
      const priority: TaskPriority = task.priority;

      expect(status).toBe('in_progress');
      expect(priority).toBe('high');
    });

    it('should properly handle filter typing', () => {
      const filters = testFilters;

      expect(filters.status).toBe('completed');
      expect(filters.priority).toBe('high');
      expect(filters.phase).toBe('development');
      expect(filters.assignee).toBe('developer');
      expect(filters.search).toBe('test');
    });

    it('should validate test data structure', () => {
      // Verify test data is properly typed
      expect(testTask.id).toBe('TEST-001');
      expect(testTask.title).toBe('Test Task');
      expect(testTask.status).toBe('in_progress');
      expect(testTask.priority).toBe('high');
      expect(testTask.estimated_hours).toBe(4);
      expect(testTask.actual_hours).toBe(2);
      expect(testTask.assignee).toBe('developer');
      expect(Array.isArray(testTask.requirements)).toBe(true);
      expect(Array.isArray(testTask.dependencies)).toBe(true);
      expect(Array.isArray(testTask.blocks)).toBe(true);
      expect(Array.isArray(testTask.notes)).toBe(true);

      expect(testPhase.title).toBe('Test Phase');
      expect(testPhase.description).toBe('Test phase description');
      expect(testPhase.status).toBe('ready');
      expect(Array.isArray(testPhase.tasks)).toBe(true);
      expect(testPhase.tasks).toHaveLength(1);

      expect(testBacklog.metadata.project).toBe('Test Project');
      expect(testBacklog.metadata.version).toBe('1.0.0');
      expect(testBacklog.phases.test).toBeDefined();
    });
  });
});

export { testTask, testPhase, testBacklog, testFilters };
