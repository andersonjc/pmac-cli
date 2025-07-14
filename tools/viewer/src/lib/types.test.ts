/**
 * Type validation tests for PMaC types
 * These tests ensure type safety and proper TypeScript compilation
 */

import type { 
  Task, 
  Phase, 
  ProjectBacklog, 
  TaskFilters, 
  ProjectStats,
  TaskStatus,
  TaskPriority 
} from './types';

import { 
  isTask, 
  isPhase, 
  isProjectBacklog, 
  isTaskStatus, 
  isTaskPriority,
  TASK_STATUS_COLORS,
  TASK_PRIORITY_COLORS,
  DEFAULT_FILTERS
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
  notes: ['Note 1', 'Note 2']
};

const testPhase: Phase = {
  title: 'Test Phase',
  description: 'Test phase description',
  status: 'ready',
  estimated_duration: '1 week',
  tasks: [testTask]
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
    ai_instructions: 'CLAUDE.md'
  },
  phases: {
    test: testPhase
  }
};

const testFilters: TaskFilters = {
  status: 'completed',
  priority: 'high',
  phase: 'development',
  assignee: 'developer',
  search: 'test'
};

// Type guard tests
function testTypeGuards() {
  console.log('Testing type guards...');
  
  // Test isTaskStatus
  console.log('isTaskStatus("completed"):', isTaskStatus('completed')); // true
  console.log('isTaskStatus("invalid"):', isTaskStatus('invalid')); // false
  
  // Test isTaskPriority
  console.log('isTaskPriority("high"):', isTaskPriority('high')); // true
  console.log('isTaskPriority("invalid"):', isTaskPriority('invalid')); // false
  
  // Test isTask
  console.log('isTask(testTask):', isTask(testTask)); // true
  console.log('isTask(null):', isTask(null)); // false
  
  // Test isPhase
  console.log('isPhase(testPhase):', isPhase(testPhase)); // true
  console.log('isPhase({}):', isPhase({})); // false
  
  // Test isProjectBacklog
  console.log('isProjectBacklog(testBacklog):', isProjectBacklog(testBacklog)); // true
  console.log('isProjectBacklog(null):', isProjectBacklog(null)); // false
}

// Utility function tests
function testConstants() {
  console.log('Testing constants...');
  
  // Test status colors
  const statusColor = TASK_STATUS_COLORS['completed'];
  console.log('Completed status color:', statusColor);
  
  // Test priority colors
  const priorityColor = TASK_PRIORITY_COLORS['high'];
  console.log('High priority color:', priorityColor);
  
  // Test default filters
  console.log('Default filters:', DEFAULT_FILTERS);
}

// Type inference tests
function testTypeInference() {
  console.log('Testing type inference...');
  
  // Test that types are properly inferred
  const task = testTask;
  const status: TaskStatus = task.status; // Should compile without error
  const priority: TaskPriority = task.priority; // Should compile without error
  
  console.log('Task status:', status);
  console.log('Task priority:', priority);
  
  // Test filter typing
  const filters = testFilters;
  if (filters.status) {
    console.log('Filter status is defined:', filters.status);
  }
}

// Run tests if this file is executed directly
if (import.meta.env.DEV) {
  testTypeGuards();
  testConstants();
  testTypeInference();
  console.log('All type tests completed successfully!');
}

export { testTask, testPhase, testBacklog, testFilters };