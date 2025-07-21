import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';

// Integration tests for PMaC CLI
// Tests the actual CLI by running it as a child process

const TEST_BACKLOG_PATH = 'test-project-backlog.yml';

const createTestBacklog = () => {
  const testBacklog = `
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
      - id: "TEST-002"
        title: "Test Task 2"
        status: "in_progress"
        priority: "medium"
        estimated_hours: 4
        requirements: []
        dependencies: ["TEST-001"]
        blocks: []
        notes: []
  
  other_phase:
    title: "Other Phase"
    description: "Another test phase"
    status: "ready"
    estimated_duration: "2 weeks"
    tasks:
      - id: "OTHER-001"
        title: "Other Task 1"
        status: "ready"
        priority: "low"
        estimated_hours: 12
        requirements: []
        dependencies: []
        blocks: []
        notes: []
`;
  writeFileSync(TEST_BACKLOG_PATH, testBacklog.trim());
};

const runPMaC = (args: string[]): { stdout: string; stderr: string; exitCode: number } => {
  // Temporarily backup original backlog
  const originalExists = existsSync('project-backlog.yml');
  let originalBacklog = '';
  if (originalExists) {
    originalBacklog = readFileSync('project-backlog.yml', 'utf8');
  }

  try {
    // Copy test backlog to expected location
    writeFileSync('project-backlog.yml', readFileSync(TEST_BACKLOG_PATH, 'utf8'));

    const result = execSync(`pnpm --silent pmac ${args.map(arg => `"${arg}"`).join(' ')}`, {
      encoding: 'utf8',
      cwd: process.cwd(),
      timeout: 10000,
      stdio: ['inherit', 'pipe', 'pipe'],
    });
    const stdout = result;

    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || error.message,
      exitCode: error.status || 1,
    };
  } finally {
    // Always restore original backlog in finally block
    try {
      if (originalExists) {
        writeFileSync('project-backlog.yml', originalBacklog);
      } else {
        if (existsSync('project-backlog.yml')) {
          unlinkSync('project-backlog.yml');
        }
      }
    } catch (error) {
      console.error('Failed to restore original backlog:', error);
    }
  }
};

describe('PMaC CLI Integration Tests', () => {
  beforeEach(() => {
    createTestBacklog();
  });

  afterEach(() => {
    // Cleanup test files
    if (existsSync(TEST_BACKLOG_PATH)) {
      unlinkSync(TEST_BACKLOG_PATH);
    }
  });

  describe('Help and Information Commands', () => {
    it('should display help information', () => {
      const result = runPMaC(['help']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('PMaC CLI - Project Management as Code Tool');
      expect(result.stdout).toContain('Task Management Commands');
      expect(result.stdout).toContain('create <taskId> <title> <phase>');
      expect(result.stdout).toContain('Examples:');
    });

    it('should list all phases', () => {
      const result = runPMaC(['phases']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Available Phases:');
      expect(result.stdout).toContain('test_phase: Test Phase');
      expect(result.stdout).toContain('other_phase: Other Phase');
      expect(result.stdout).toContain('Tasks: 2');
      expect(result.stdout).toContain('Tasks: 1');
    });

    it('should list all tasks', () => {
      const result = runPMaC(['list']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Project Tasks:');
      expect(result.stdout).toContain('TEST-001: Test Task 1');
      expect(result.stdout).toContain('TEST-002: Test Task 2');
      expect(result.stdout).toContain('OTHER-001: Other Task 1');
    });

    it('should filter tasks by status', () => {
      const result = runPMaC(['list', 'ready']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('TEST-001: Test Task 1');
      expect(result.stdout).toContain('OTHER-001: Other Task 1');
      expect(result.stdout).not.toContain('TEST-002: Test Task 2'); // in_progress
    });

    it('should filter tasks by priority', () => {
      const result = runPMaC(['list', '', 'high']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('TEST-001: Test Task 1');
      expect(result.stdout).not.toContain('TEST-002: Test Task 2'); // medium
      expect(result.stdout).not.toContain('OTHER-001: Other Task 1'); // low
    });
  });

  describe('Task Status Updates', () => {
    it('should update task status', () => {
      const result = runPMaC(['update', 'TEST-001', 'in_progress']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Updated TEST-001 status to in_progress');
    });

    it('should update task status with note', () => {
      const result = runPMaC(['update', 'TEST-001', 'testing', 'Ready for review']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Updated TEST-001 status to testing');
      expect(result.stdout).toContain('Added note: Ready for review');
    });

    it('should handle non-existent task', () => {
      const result = runPMaC(['update', 'NONEXISTENT', 'completed']);

      expect(result.exitCode).toBe(0); // CLI doesn't exit with error code for not found
      expect(result.stdout).toContain('Task NONEXISTENT not found');
    });
  });

  describe('Task Creation', () => {
    it('should create a new task with minimal parameters', () => {
      const result = runPMaC(['create', 'NEW-001', 'New Test Task', 'test_phase']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✅ Created task NEW-001: New Test Task in phase test_phase');
      expect(result.stdout).toContain('Priority: medium, Estimated hours: 8');
    });

    it('should create a new task with all parameters', () => {
      const result = runPMaC([
        'create',
        'NEW-002',
        'High Priority Task',
        'other_phase',
        'critical',
        '16',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        '✅ Created task NEW-002: High Priority Task in phase other_phase'
      );
      expect(result.stdout).toContain('Priority: critical, Estimated hours: 16');
    });

    it('should reject duplicate task ID', () => {
      const result = runPMaC(['create', 'TEST-001', 'Duplicate Task', 'test_phase']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Task TEST-001 already exists');
    });

    it('should reject invalid phase', () => {
      const result = runPMaC(['create', 'NEW-001', 'New Task', 'invalid_phase']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Phase 'invalid_phase' not found");
      expect(result.stdout).toContain('Available phases: test_phase, other_phase');
    });
  });

  describe('Task Attribute Updates', () => {
    it('should update task priority', () => {
      const result = runPMaC(['set', 'TEST-001', 'priority', 'critical']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✅ Updated TEST-001 priority to: critical');
    });

    it('should update estimated hours', () => {
      const result = runPMaC(['set', 'TEST-001', 'estimated_hours', '12']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✅ Updated TEST-001 estimated_hours to: 12');
    });

    it('should update task title', () => {
      const result = runPMaC(['set', 'TEST-001', 'title', 'Updated Task Title']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✅ Updated TEST-001 title to: Updated Task Title');
    });

    it('should update dependencies', () => {
      const result = runPMaC(['set', 'TEST-001', 'dependencies', 'OTHER-001,TEST-002']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✅ Updated TEST-001 dependencies to: OTHER-001, TEST-002');
    });

    it('should reject invalid priority', () => {
      const result = runPMaC(['set', 'TEST-001', 'priority', 'invalid']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Priority must be: critical, high, medium, or low');
    });

    it('should reject invalid estimated hours', () => {
      const result = runPMaC(['set', 'TEST-001', 'estimated_hours', 'invalid']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Estimated hours must be a positive number');
    });
  });

  describe('Dependency Management', () => {
    it('should add dependency', () => {
      const result = runPMaC(['add-dep', 'TEST-001', 'OTHER-001']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✅ Added dependency: TEST-001 now depends on OTHER-001');
    });

    it('should remove dependency', () => {
      const result = runPMaC(['rm-dep', 'TEST-002', 'TEST-001']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        '✅ Removed dependency: TEST-002 no longer depends on TEST-001'
      );
    });

    it('should prevent circular dependencies', () => {
      // Given that TEST-002 already depends on TEST-001 (in the test backlog)
      // Try to make TEST-001 depend on TEST-002, which would create a circle
      const result = runPMaC(['add-dep', 'TEST-001', 'TEST-002']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        'Adding dependency TEST-002 to TEST-001 would create a circular dependency'
      );
    });

    it('should handle non-existent dependency task', () => {
      const result = runPMaC(['add-dep', 'TEST-001', 'NONEXISTENT']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Dependency task NONEXISTENT not found');
    });
  });

  describe('Task Movement', () => {
    it('should move task between phases', () => {
      const result = runPMaC(['move', 'TEST-001', 'other_phase']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✅ Moved task TEST-001 from test_phase to other_phase');
    });

    it('should reject moving to same phase', () => {
      const result = runPMaC(['move', 'TEST-001', 'test_phase']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Task TEST-001 is already in phase test_phase');
    });

    it('should reject moving to invalid phase', () => {
      const result = runPMaC(['move', 'TEST-001', 'invalid_phase']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Target phase 'invalid_phase' not found");
    });
  });

  describe('Note Management', () => {
    it('should add note to task', () => {
      const result = runPMaC(['note', 'TEST-001', 'This is a test note']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Added note to TEST-001: This is a test note');
    });

    it('should handle multi-word notes', () => {
      const result = runPMaC(['note', 'TEST-001', 'This', 'is', 'a', 'multi-word', 'note']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Added note to TEST-001: This is a multi-word note');
    });
  });

  describe('Validation', () => {
    it('should validate dependencies successfully', () => {
      const result = runPMaC(['validate']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Dependency Validation:');
      expect(result.stdout).toContain('✅ All dependencies are valid');
    });
  });

  describe('Critical Path Analysis', () => {
    it('should show critical path', () => {
      const result = runPMaC(['critical-path']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Critical Path Analysis:');
      expect(result.stdout).toContain('🚀 Entry Points (no dependencies):');
      expect(result.stdout).toContain('⚡ Critical Path:');
      expect(result.stdout).toContain('📊 Total Critical Path:');
      expect(result.stdout).toContain('hours');
    });
  });

  describe('Bulk Operations', () => {
    it('should update all tasks in phase', () => {
      const result = runPMaC(['bulk-phase', 'test_phase', 'completed']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Updated all tasks in phase 'test_phase' to status 'completed'"
      );
    });

    it('should reject invalid phase for bulk operation', () => {
      const result = runPMaC(['bulk-phase', 'invalid_phase', 'completed']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Phase 'invalid_phase' not found");
    });
  });

  describe('Custom Backlog Path Support', () => {
    it('should work with explicit backlog path from root', () => {
      // Create a custom backlog in a subdirectory
      const customPath = 'tests/test-custom-backlog.yml';
      writeFileSync(customPath, readFileSync(TEST_BACKLOG_PATH, 'utf8'));

      try {
        const result = runPMaCWithCustomPath(customPath, ['list']);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Using backlog file:');
        expect(result.stdout).toContain('tests/test-custom-backlog.yml');
        expect(result.stdout).toContain('TEST-001: Test Task 1');
        expect(result.stdout).toContain('TEST-002: Test Task 2');
      } finally {
        if (existsSync(customPath)) {
          unlinkSync(customPath);
        }
      }
    });

    it('should work with custom backlog for task operations', () => {
      const customPath = 'tests/test-operations-backlog.yml';
      writeFileSync(customPath, readFileSync(TEST_BACKLOG_PATH, 'utf8'));

      try {
        // Test updating a task status
        const updateResult = runPMaCWithCustomPath(customPath, [
          'update',
          'TEST-001',
          'completed',
          'Custom path test',
        ]);
        expect(updateResult.exitCode).toBe(0);
        expect(updateResult.stdout).toContain('Updated TEST-001 status to completed');
        expect(updateResult.stdout).toContain('Added note: Custom path test');

        // Test adding a note
        const noteResult = runPMaCWithCustomPath(customPath, [
          'note',
          'TEST-002',
          'Custom path note test',
        ]);
        expect(noteResult.exitCode).toBe(0);
        expect(noteResult.stdout).toContain('Added note to TEST-002: Custom path note test');

        // Test creating a task
        const createResult = runPMaCWithCustomPath(customPath, [
          'create',
          'CUSTOM-001',
          'Custom Path Task',
          'test_phase',
        ]);
        expect(createResult.exitCode).toBe(0);
        expect(createResult.stdout).toContain(
          '✅ Created task CUSTOM-001: Custom Path Task in phase test_phase'
        );
      } finally {
        if (existsSync(customPath)) {
          unlinkSync(customPath);
        }
      }
    });

    it('should show correct error message for non-existent custom path', () => {
      const result = runPMaCWithCustomPath('non/existent/path.yml', ['list']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('❌ PMaC Project Not Initialized');
      expect(result.stderr).toContain('non/existent/path.yml');
      expect(result.stderr).toContain('Alternative option:');
      expect(result.stderr).toContain(
        '--backlog flag: pnpm pmac --backlog custom/path/project-backlog.yml'
      );
    });
  });

  describe('Path Resolution Logic', () => {
    it('should resolve relative paths correctly', () => {
      // Test that relative paths work from any directory
      const customPath = 'tests/test-relative-path.yml';
      writeFileSync(customPath, readFileSync(TEST_BACKLOG_PATH, 'utf8'));

      try {
        const result = runPMaCWithCustomPath(customPath, ['phases']);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Available Phases:');
        expect(result.stdout).toContain('test_phase: Test Phase');
        expect(result.stdout).toContain('other_phase: Other Phase');
      } finally {
        if (existsSync(customPath)) {
          unlinkSync(customPath);
        }
      }
    });

    it('should work with nested directory paths', () => {
      // Create a nested directory structure
      const nestedPath = 'viewer/test-nested-backlog.yml';
      writeFileSync(nestedPath, readFileSync(TEST_BACKLOG_PATH, 'utf8'));

      try {
        const result = runPMaCWithCustomPath(nestedPath, ['validate']);

        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain('Dependency Validation:');
        expect(result.stdout).toContain('✅ All dependencies are valid');
      } finally {
        if (existsSync(nestedPath)) {
          unlinkSync(nestedPath);
        }
      }
    });
  });

  describe('Enhanced Error Messages', () => {
    it('should show helpful alternative options in error messages', () => {
      // Test with a non-existent custom path to trigger error message
      const result = runPMaCWithCustomPath('non/existent/path.yml', ['list']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('❌ PMaC Project Not Initialized');
      expect(result.stderr).toContain('non/existent/path.yml');
      expect(result.stderr).toContain('Alternative option:');
      expect(result.stderr).toContain(
        '--backlog flag: pnpm pmac --backlog custom/path/project-backlog.yml'
      );
      expect(result.stderr).toContain('For more information, see: project-management-as-code.md');
    });
  });

  describe('Error Handling', () => {
    it('should show usage for incomplete create command', () => {
      const result = runPMaC(['create', 'INCOMPLETE']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Usage: pnpm pmac create <taskId> <title> <phase>');
    });

    it('should show usage for incomplete update command', () => {
      const result = runPMaC(['update', 'TEST-001']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Usage: pnpm pmac update <taskId> <status>');
    });

    it('should show usage for incomplete set command', () => {
      const result = runPMaC(['set', 'TEST-001']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Usage: pnpm pmac set <taskId> <attribute> <value>');
    });
  });
});

// Helper function to run PMaC with custom backlog path
const runPMaCWithCustomPath = (
  backlogPath: string,
  args: string[]
): { stdout: string; stderr: string; exitCode: number } => {
  try {
    const result = execSync(
      `pnpm --silent pmac --backlog "${backlogPath}" ${args.map(arg => `"${arg}"`).join(' ')}`,
      {
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 10000,
        stdio: ['inherit', 'pipe', 'pipe'],
      }
    );

    return { stdout: result, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || error.message,
      exitCode: error.status || 1,
    };
  }
};
