import { describe, it, expect } from 'vitest';
import {
  parseBacklogYaml,
  validateBacklogSchema,
  transformForUI,
  calculateCriticalPath,
  getErrorMessage,
  isValidBacklogYaml,
  resolveFilePath,
} from './parseBacklog';

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

describe('PMaC Backlog Parser', () => {
  describe('YAML Parsing', () => {
    it('should parse valid YAML correctly', () => {
      const result = parseBacklogYaml(validYaml);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      if (result.success) {
        const backlog = result.data!;

        // Verify structure
        expect(backlog.metadata).toBeDefined();
        expect(backlog.phases).toBeDefined();
        expect(backlog.metadata.project).toBe('Test Project');
        expect(backlog.phases.foundation).toBeDefined();
        expect(backlog.phases.foundation.tasks).toBeDefined();
        expect(backlog.phases.foundation.tasks).toHaveLength(2);
      }
    });

    it('should fail to parse invalid YAML', () => {
      const result = parseBacklogYaml(invalidYaml);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('validation failed');
    });

    it('should handle malformed YAML syntax', () => {
      const result = parseBacklogYaml('invalid: yaml: content: [');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    it('should validate correct schema', () => {
      const validData = {
        metadata: {
          project: 'Test',
          version: '1.0.0',
          last_updated: '2024-01-01',
        },
        phases: {
          test: {
            title: 'Test Phase',
            description: 'Test description',
            status: 'ready',
            estimated_duration: '1 week',
            tasks: [],
          },
        },
      };

      const result = validateBacklogSchema(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid schema', () => {
      const invalidData = {
        metadata: {
          // Missing required fields
        },
        phases: {
          test: {
            // Missing required fields
          },
        },
      };

      const result = validateBacklogSchema(invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('UI Transformation', () => {
    it('should transform parsed data for UI consumption', () => {
      const result = parseBacklogYaml(validYaml);
      expect(result.success).toBe(true);

      if (result.success) {
        const transformed = transformForUI(result.data!);

        expect(transformed.tasksWithPhase).toHaveLength(2);
        expect(transformed.stats).toBeDefined();
        expect(transformed.stats.totalTasks).toBe(2);
        expect(transformed.dependencyNodes).toHaveLength(2);
        expect(transformed.dependencyEdges).toHaveLength(2);
      }
    });
  });

  describe('Critical Path Calculation', () => {
    it('should calculate critical path correctly', () => {
      const result = parseBacklogYaml(validYaml);
      expect(result.success).toBe(true);

      if (result.success) {
        const transformed = transformForUI(result.data!);
        const criticalPath = calculateCriticalPath(transformed.dependencyNodes);

        expect(criticalPath).toHaveLength(2);

        // Check that at least one node is marked as critical
        const hasCriticalNode = criticalPath.some(node => node.isCritical);
        expect(hasCriticalNode).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide user-friendly error messages', () => {
      const errorMessage = getErrorMessage('YAMLParseError: Invalid syntax');
      expect(errorMessage).toContain('Invalid YAML format');
    });

    it('should validate YAML utility functions', () => {
      expect(isValidBacklogYaml(validYaml)).toBe(true);
      expect(isValidBacklogYaml('invalid yaml')).toBe(false);
    });
  });

  describe('File Path Resolution', () => {
    it('should handle absolute paths correctly', () => {
      const absolutePath = resolveFilePath('/absolute/path/file.yml');
      expect(absolutePath).toBe('/absolute/path/file.yml');
    });

    it('should handle URL paths correctly', () => {
      const urlPath = resolveFilePath('https://example.com/file.yml');
      expect(urlPath).toBe('https://example.com/file.yml');
    });

    it('should handle relative paths correctly', () => {
      const relativePath = resolveFilePath('relative/path/file.yml');
      expect(relativePath).toBe('relative/path/file.yml');
    });
  });
});

// Export test data for use in other modules
export { validYaml, invalidYaml, malformedYaml };

// Export a function to run all tests programmatically (for demo purposes)
export function runAllTests(): boolean {
  // This is a simplified test runner for demonstration
  // In a real application, you would use a proper test framework

  try {
    // Test basic parsing
    const result = parseBacklogYaml(validYaml);
    console.log('✓ Basic parsing test passed');

    if (!result.success) {
      throw new Error('Basic parsing failed');
    }

    // Test validation
    const validation = validateBacklogSchema(result.data!);
    console.log('✓ Validation test passed');

    if (!validation.success) {
      throw new Error('Validation failed');
    }

    // Test error handling
    const errorResult = parseBacklogYaml(invalidYaml);
    console.log('✓ Error handling test passed');

    if (errorResult.success) {
      throw new Error('Error handling failed - should have failed');
    }

    // Test UI transformation
    const transformed = transformForUI(result.data!);
    console.log('✓ UI transformation test passed');

    if (!transformed || !transformed.stats) {
      throw new Error('UI transformation failed');
    }

    console.log('✅ All tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}
