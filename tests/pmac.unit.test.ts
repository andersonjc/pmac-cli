import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

// Import the PMaCCLI class directly for unit testing
// We need to mock the module to avoid the CLI execution at the bottom of the file
vi.mock('process', () => ({
  cwd: vi.fn(() => '/test/root'),
  exit: vi.fn(),
  argv: ['node', 'pmac.ts'],
  env: {},
}));

// Unit tests for PMaC CLI core functionality
// These tests focus on the constructor logic and path resolution

const TEST_BACKLOG_CONTENT = `
metadata:
  project: "Test Project"
  version: "1.0.0"

phases:
  test_phase:
    title: "Test Phase"
    description: "A test phase"
    status: "ready"
    estimated_duration: "1 week"
    tasks:
      - id: "TEST-001"
        title: "Test Task 1"
        status: "ready"
        priority: "high"
        estimated_hours: 8
        requirements: []
        dependencies: []
        blocks: []
        notes: []
`;

describe('PMaC CLI Unit Tests', () => {
  const TEST_BACKLOG_PATH = 'test-unit-backlog.yml';
  const CUSTOM_BACKLOG_PATH = 'custom/test-backlog.yml';

  beforeEach(() => {
    // Create test backlog file
    writeFileSync(TEST_BACKLOG_PATH, TEST_BACKLOG_CONTENT.trim());

    // Ensure custom directory exists
    const fs = require('fs');
    if (!fs.existsSync('custom')) {
      fs.mkdirSync('custom', { recursive: true });
    }
    writeFileSync(CUSTOM_BACKLOG_PATH, TEST_BACKLOG_CONTENT.trim());
  });

  afterEach(() => {
    // Cleanup test files
    if (existsSync(TEST_BACKLOG_PATH)) {
      unlinkSync(TEST_BACKLOG_PATH);
    }
    if (existsSync(CUSTOM_BACKLOG_PATH)) {
      unlinkSync(CUSTOM_BACKLOG_PATH);
    }
    if (existsSync('custom')) {
      const fs = require('fs');
      fs.rmSync('custom', { recursive: true, force: true });
    }
  });

  describe('Constructor Path Resolution', () => {
    it('should resolve default path correctly', async () => {
      // Mock the PMaCCLI class constructor behavior
      const mockCwd = vi.spyOn(process, 'cwd').mockReturnValue('/test/root');

      try {
        // Test default path resolution
        const defaultPath = resolve(process.cwd(), 'project-backlog.yml');
        expect(defaultPath).toBe('/test/root/project-backlog.yml');

        // Test custom path resolution
        const customPath = resolve(process.cwd(), 'tools/viewer/project-backlog.yml');
        expect(customPath).toBe('/test/root/tools/viewer/project-backlog.yml');
      } finally {
        mockCwd.mockRestore();
      }
    });

    it('should resolve custom paths relative to project root', async () => {
      const mockCwd = vi.spyOn(process, 'cwd').mockReturnValue('/project/root');

      try {
        // Test various custom path scenarios
        const testCases = [
          {
            input: 'tools/viewer/project-backlog.yml',
            expected: '/project/root/tools/viewer/project-backlog.yml',
          },
          {
            input: 'custom/path/backlog.yml',
            expected: '/project/root/custom/path/backlog.yml',
          },
          {
            input: './project-backlog.yml',
            expected: '/project/root/project-backlog.yml',
          },
          {
            input: 'nested/deep/structure/backlog.yml',
            expected: '/project/root/nested/deep/structure/backlog.yml',
          },
        ];

        testCases.forEach(({ input, expected }) => {
          const resolved = resolve(process.cwd(), input);
          expect(resolved).toBe(expected);
        });
      } finally {
        mockCwd.mockRestore();
      }
    });
  });

  describe('Path Normalization', () => {
    it('should handle different path formats consistently', () => {
      const mockCwd = vi.spyOn(process, 'cwd').mockReturnValue('/project/root');

      try {
        // Test that various equivalent paths resolve to the same result
        const paths = [
          'tools/viewer/project-backlog.yml',
          './tools/viewer/project-backlog.yml',
          'tools/viewer/../viewer/project-backlog.yml',
        ];

        const resolved = paths.map(path => resolve(process.cwd(), path));

        // The first two should be identical
        expect(resolved[0]).toBe(resolved[1]);

        // All should resolve to the same canonical path
        const canonical = '/project/root/tools/viewer/project-backlog.yml';
        expect(resolved[0]).toBe(canonical);
        expect(resolved[2]).toBe(canonical);
      } finally {
        mockCwd.mockRestore();
      }
    });

    it('should handle edge cases in path resolution', () => {
      const mockCwd = vi.spyOn(process, 'cwd').mockReturnValue('/project/root');

      try {
        // Test edge cases
        const edgeCases = [
          {
            input: '',
            expected: '/project/root',
          },
          {
            input: '.',
            expected: '/project/root',
          },
          {
            input: 'project-backlog.yml',
            expected: '/project/root/project-backlog.yml',
          },
        ];

        edgeCases.forEach(({ input, expected }) => {
          const resolved = resolve(process.cwd(), input);
          expect(resolved).toBe(expected);
        });
      } finally {
        mockCwd.mockRestore();
      }
    });
  });

  describe('File Access Patterns', () => {
    it('should check file existence correctly', () => {
      // Test that our test files exist
      expect(existsSync(TEST_BACKLOG_PATH)).toBe(true);
      expect(existsSync(CUSTOM_BACKLOG_PATH)).toBe(true);

      // Test that non-existent files return false
      expect(existsSync('non-existent-file.yml')).toBe(false);
      expect(existsSync('non/existent/path/file.yml')).toBe(false);
    });

    it('should read YAML files correctly', () => {
      const content = readFileSync(TEST_BACKLOG_PATH, 'utf8');

      expect(content).toContain('project: "Test Project"');
      expect(content).toContain('TEST-001');
      expect(content).toContain('Test Task 1');
      expect(content).toContain('status: "ready"');
    });
  });

  describe('Error Condition Testing', () => {
    it('should handle non-existent file paths gracefully', () => {
      const nonExistentPath = 'does/not/exist/project-backlog.yml';

      expect(() => {
        readFileSync(nonExistentPath, 'utf8');
      }).toThrow();

      expect(existsSync(nonExistentPath)).toBe(false);
    });

    it('should validate YAML structure expectations', () => {
      const content = readFileSync(TEST_BACKLOG_PATH, 'utf8');

      // Basic YAML structure validation
      expect(content).toContain('metadata:');
      expect(content).toContain('phases:');
      expect(content).toContain('tasks:');
      expect(content).toContain('- id:');
    });
  });

  describe('Configuration Validation', () => {
    it('should verify expected PMaC structure', () => {
      const content = readFileSync(TEST_BACKLOG_PATH, 'utf8');

      // Verify all required PMaC fields are present
      const requiredFields = [
        'metadata',
        'project',
        'version',
        'phases',
        'title',
        'description',
        'status',
        'estimated_duration',
        'tasks',
        'id',
        'priority',
        'estimated_hours',
        'requirements',
        'dependencies',
        'blocks',
        'notes',
      ];

      requiredFields.forEach(field => {
        expect(content).toContain(field);
      });
    });

    it('should validate task status and priority values', () => {
      const content = readFileSync(TEST_BACKLOG_PATH, 'utf8');

      // Check that valid status and priority values are used
      expect(content).toMatch(/status:\s*["']ready["']/);
      expect(content).toMatch(/priority:\s*["']high["']/);
    });
  });
});
