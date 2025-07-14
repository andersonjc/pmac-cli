/**
 * Tests for PMaC Backlog YAML Parser
 */

import { parseBacklogYaml, validateBacklogSchema, transformForUI, calculateCriticalPath, getErrorMessage, isValidBacklogYaml, resolveFilePath } from './parseBacklog';

// Test data - Valid PMaC backlog YAML
const validYaml = `
metadata:
  project: "Test Project"
  version: "1.0.0"
  last_updated: "2024-01-01"
  current_sprint: "test"
  pmac_methodology: "project-management-as-code.md"
  technical_requirements: "requirements.md"
  decision_log: "prompts-log.md"
  ai_instructions: "CLAUDE.md"

phases:
  foundation:
    title: "Foundation Phase"
    description: "Initial setup"
    status: "ready"
    estimated_duration: "1 week"
    tasks:
      - id: "TEST-001"
        title: "Test Task 1"
        status: "completed"
        priority: "high"
        estimated_hours: 4
        actual_hours: 3
        assignee: "developer"
        requirements:
          - "Requirement 1"
          - "Requirement 2"
        acceptance_criteria:
          - "Criteria 1"
          - "Criteria 2"
        dependencies: []
        blocks:
          - "TEST-002"
        notes:
          - "Note 1"
      - id: "TEST-002"
        title: "Test Task 2"
        status: "in_progress"
        priority: "medium"
        estimated_hours: 6
        requirements:
          - "Requirement 3"
        dependencies:
          - "TEST-001"
        blocks: []
        notes: []

epic_summary:
  total_estimated_hours: 10
  estimated_duration: "1 week"
  critical_path:
    - "TEST-001 → TEST-002"
  success_criteria:
    technical:
      - "All tests pass"
    business:
      - "Project delivered on time"
    pmac_methodology:
      - "PMaC methodology validated"

risks:
  high:
    - risk: "High risk example"
      mitigation: "Mitigation strategy"
  medium:
    - risk: "Medium risk example"
      mitigation: "Another mitigation"
  low:
    - risk: "Low risk example"
      mitigation: "Simple mitigation"
`;

// Test data - Invalid YAML
const invalidYaml = `
metadata:
  project: "Test Project"
  # Missing required fields
phases:
  foundation:
    title: "Foundation Phase"
    # Missing required fields
    tasks:
      - id: "TEST-001"
        title: "Test Task 1"
        # Missing required fields
`;

// Test data - Malformed YAML
const malformedYaml = `
metadata:
  project: "Test Project"
  version: "1.0.0"
phases:
  foundation:
    title: "Foundation Phase"
    tasks:
      - id: "TEST-001"
        title: "Test Task 1"
        status: invalid_status  # Invalid enum value
        priority: "invalid_priority"  # Invalid enum value
        estimated_hours: "not_a_number"  # Should be number
        requirements: "not_an_array"  # Should be array
        dependencies: []
        blocks: []
        notes: []
`;

// Test functions
export function testParseValidYaml(): boolean {
  console.log('Testing valid YAML parsing...');
  const result = parseBacklogYaml(validYaml);
  
  if (!result.success) {
    console.error('Failed to parse valid YAML:', result.error);
    return false;
  }
  
  const backlog = result.data!;
  
  // Verify structure
  if (!backlog.metadata || !backlog.phases) {
    console.error('Invalid parsed structure');
    return false;
  }
  
  if (backlog.metadata.project !== 'Test Project') {
    console.error('Incorrect project name');
    return false;
  }
  
  if (!backlog.phases.foundation || !backlog.phases.foundation.tasks) {
    console.error('Missing foundation phase or tasks');
    return false;
  }
  
  if (backlog.phases.foundation.tasks.length !== 2) {
    console.error('Incorrect number of tasks');
    return false;
  }
  
  console.log('✅ Valid YAML parsing test passed');
  return true;
}

export function testParseInvalidYaml(): boolean {
  console.log('Testing invalid YAML parsing...');
  const result = parseBacklogYaml(invalidYaml);
  
  if (result.success) {
    console.error('Should have failed to parse invalid YAML');
    return false;
  }
  
  if (!result.error || !result.error.includes('validation failed')) {
    console.error('Should have validation error');
    return false;
  }
  
  console.log('✅ Invalid YAML parsing test passed');
  return true;
}

export function testSchemaValidation(): boolean {
  console.log('Testing schema validation...');
  
  // Test valid schema
  const validData = {
    metadata: {
      project: 'Test',
      version: '1.0.0',
      last_updated: '2024-01-01'
    },
    phases: {
      test: {
        title: 'Test Phase',
        description: 'Test description',
        status: 'ready',
        estimated_duration: '1 week',
        tasks: []
      }
    }
  };
  
  const validResult = validateBacklogSchema(validData);
  if (!validResult.success) {
    console.error('Valid schema should pass validation:', validResult.error);
    return false;
  }
  
  // Test invalid schema
  const invalidData = {
    metadata: {
      // Missing required fields
    },
    phases: {
      test: {
        // Missing required fields
      }
    }
  };
  
  const invalidResult = validateBacklogSchema(invalidData);
  if (invalidResult.success) {
    console.error('Invalid schema should fail validation');
    return false;
  }
  
  console.log('✅ Schema validation test passed');
  return true;
}

export function testTransformForUI(): boolean {
  console.log('Testing UI transformation...');
  const result = parseBacklogYaml(validYaml);
  
  if (!result.success) {
    console.error('Failed to parse YAML for UI test');
    return false;
  }
  
  const transformed = transformForUI(result.data!);
  
  if (transformed.tasksWithPhase.length !== 2) {
    console.error('Incorrect number of tasks with phase');
    return false;
  }
  
  if (!transformed.stats || transformed.stats.totalTasks !== 2) {
    console.error('Incorrect statistics');
    return false;
  }
  
  if (transformed.dependencyNodes.length !== 2) {
    console.error('Incorrect number of dependency nodes');
    return false;
  }
  
  if (transformed.dependencyEdges.length !== 2) {
    console.error('Incorrect number of dependency edges');
    return false;
  }
  
  console.log('✅ UI transformation test passed');
  return true;
}

export function testCriticalPath(): boolean {
  console.log('Testing critical path calculation...');
  const result = parseBacklogYaml(validYaml);
  
  if (!result.success) {
    console.error('Failed to parse YAML for critical path test');
    return false;
  }
  
  const transformed = transformForUI(result.data!);
  const criticalPath = calculateCriticalPath(transformed.dependencyNodes);
  
  if (criticalPath.length !== 2) {
    console.error('Incorrect critical path length');
    return false;
  }
  
  // Check that at least one node is marked as critical
  const hasCriticalNode = criticalPath.some(node => node.isCritical);
  if (!hasCriticalNode) {
    console.error('No nodes marked as critical');
    return false;
  }
  
  console.log('✅ Critical path calculation test passed');
  return true;
}

export function testErrorHandling(): boolean {
  console.log('Testing error handling...');
  
  // Test malformed YAML
  const malformedResult = parseBacklogYaml('invalid: yaml: content: [');
  if (malformedResult.success) {
    console.error('Should fail on malformed YAML');
    return false;
  }
  
  // Test user-friendly error messages
  const errorMessage = getErrorMessage('YAMLParseError: Invalid syntax');
  if (!errorMessage.includes('Invalid YAML format')) {
    console.error('Should provide user-friendly error message');
    return false;
  }
  
  // Test validation utility
  const isValid = isValidBacklogYaml(validYaml);
  if (!isValid) {
    console.error('Should recognize valid YAML');
    return false;
  }
  
  const isInvalid = isValidBacklogYaml('invalid yaml');
  if (isInvalid) {
    console.error('Should recognize invalid YAML');
    return false;
  }
  
  console.log('✅ Error handling test passed');
  return true;
}

export function testFilePathResolution(): boolean {
  console.log('Testing file path resolution...');
  
  // Test absolute path
  const absolutePath = resolveFilePath('/absolute/path/file.yml');
  if (absolutePath !== '/absolute/path/file.yml') {
    console.error('Absolute path should remain unchanged');
    return false;
  }
  
  // Test URL
  const urlPath = resolveFilePath('https://example.com/file.yml');
  if (urlPath !== 'https://example.com/file.yml') {
    console.error('URL path should remain unchanged');
    return false;
  }
  
  // Test relative path
  const relativePath = resolveFilePath('relative/path/file.yml');
  if (relativePath !== 'relative/path/file.yml') {
    console.error('Relative path handling failed');
    return false;
  }
  
  console.log('✅ File path resolution test passed');
  return true;
}

// Run all tests
export function runAllTests(): boolean {
  console.log('Running PMaC Backlog Parser Tests...');
  
  const tests = [
    testParseValidYaml,
    testParseInvalidYaml,
    testSchemaValidation,
    testTransformForUI,
    testCriticalPath,
    testErrorHandling,
    testFilePathResolution
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Test failed with exception:`, error);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed');
    return false;
  }
}

// Export test data for use in other modules
export { validYaml, invalidYaml, malformedYaml };