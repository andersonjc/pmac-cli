<script lang="ts">
  // PMaC Backlog Viewer - Root Application Component
  import type { ProjectBacklog } from './lib/types';
  import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from './lib/types';
  import { parseBacklogYaml } from './lib/parseBacklog';
  import { runAllTests } from './lib/parseBacklog.test';
  import { 
    appState, 
    projectTitle, 
    filteredTasks,
    loadBacklog, 
    setLoading, 
    setError,
    loadUserPreferences,
    saveUserPreferences
  } from './lib/stores';
  import FilterPanel from './components/FilterPanel.svelte';
  import StatsPanel from './components/StatsPanel.svelte';
  import { onMount } from 'svelte';
  
  // Subscribe to reactive stores
  $: isLoading = $appState.isLoading;
  $: backlog = $appState.backlog;
  $: error = $appState.error;
  
  // Parser testing
  let testResults = '';
  let parserStatus = 'Ready to test';
  
  // Load the actual project backlog
  onMount(async () => {
    // Load user preferences
    loadUserPreferences();
    saveUserPreferences();
    
    setLoading(true);
    
    try {
      const response = await fetch('/project-backlog.yml');
      
      if (!response.ok) {
        // If file doesn't exist, create a sample backlog
        const sampleBacklog = createSampleBacklog();
        loadBacklog(sampleBacklog);
        setLoading(false);
        return;
      }
      
      const yamlContent = await response.text();
      const parseResult = parseBacklogYaml(yamlContent);
      
      if (parseResult.success && parseResult.data) {
        loadBacklog(parseResult.data);
        setError(null);
      } else {
        setError(parseResult.error || 'Failed to parse backlog');
        // Still create sample backlog as fallback
        const sampleBacklog = createSampleBacklog();
        loadBacklog(sampleBacklog);
      }
    } catch (err) {
      // Create sample backlog as fallback
      const sampleBacklog = createSampleBacklog();
      loadBacklog(sampleBacklog);
      setError('Could not load project-backlog.yml, using sample data');
    } finally {
      setLoading(false);
    }
  });
  
  function createSampleBacklog(): ProjectBacklog {
    return {
      metadata: {
        project: "PMaC Backlog Viewer Demo",
        version: "1.0.0-demo",
        last_updated: "2025-01-15",
        current_sprint: "foundation",
        pmac_methodology: "project-management-as-code.md",
        technical_requirements: "project-requirements.md",
        decision_log: "prompts-log.md",
        ai_instructions: "CLAUDE.md"
      },
      phases: {
        foundation: {
          title: "Foundation & Setup",
          description: "Initial project setup and configuration",
          status: "in_progress",
          estimated_duration: "1 week",
          tasks: [
            {
              id: "DEMO-001",
              title: "Project Structure Setup",
              status: "completed",
              priority: "critical",
              estimated_hours: 4,
              actual_hours: 3,
              assignee: "claude-code",
              requirements: [
                "Create directory structure",
                "Set up build configuration",
                "Initialize TypeScript"
              ],
              acceptance_criteria: [
                "All directories created",
                "Build passes successfully",
                "TypeScript compiles without errors"
              ],
              dependencies: [],
              blocks: ["DEMO-002"],
              notes: [
                "2025-01-15: Completed successfully with dark mode theme"
              ]
            },
            {
              id: "DEMO-002", 
              title: "YAML Parser Implementation",
              status: "completed",
              priority: "high",
              estimated_hours: 6,
              actual_hours: 5,
              assignee: "claude-code",
              requirements: [
                "Parse YAML files",
                "Validate schema",
                "Handle errors gracefully"
              ],
              acceptance_criteria: [
                "Parses valid YAML successfully",
                "Validates against schema",
                "Provides user-friendly error messages"
              ],
              dependencies: ["DEMO-001"],
              blocks: ["DEMO-003"],
              notes: [
                "2025-01-15: Comprehensive parser with validation complete"
              ]
            },
            {
              id: "DEMO-003",
              title: "UI Components Development",
              status: "in_progress",
              priority: "high",
              estimated_hours: 8,
              actual_hours: 2,
              assignee: "claude-code",
              requirements: [
                "Create task cards",
                "Build phase groups",
                "Add dark mode styling"
              ],
              acceptance_criteria: [
                "Task cards display correctly",
                "Phase groups are collapsible",
                "Dark mode theme is consistent"
              ],
              dependencies: ["DEMO-002"],
              blocks: [],
              notes: [
                "2025-01-15: Started development with basic layout"
              ]
            }
          ]
        }
      },
      epic_summary: {
        total_estimated_hours: 18,
        estimated_duration: "1 week",
        critical_path: ["DEMO-001 → DEMO-002 → DEMO-003"],
        success_criteria: {
          technical: [
            "Dark mode Svelte application",
            "YAML parsing with validation",
            "TypeScript type safety"
          ],
          business: [
            "Intuitive PMaC backlog visualization",
            "Professional developer interface"
          ],
          pmac_methodology: [
            "Complete audit trail",
            "Traceable requirements"
          ]
        }
      },
      risks: {
        high: [
          {
            risk: "Complex dependency visualization",
            mitigation: "Start with simple implementation"
          }
        ],
        medium: [
          {
            risk: "Mobile responsiveness",
            mitigation: "Progressive enhancement approach"
          }
        ],
        low: [
          {
            risk: "Bundle size optimization",
            mitigation: "Use tree shaking and code splitting"
          }
        ]
      }
    };
  }
  
  function runParserTests() {
    testResults = '';
    parserStatus = 'Running tests...';
    
    // Capture console output
    const originalLog = console.log;
    const originalError = console.error;
    let output = '';
    
    console.log = (...args) => {
      output += args.join(' ') + '\n';
      originalLog(...args);
    };
    
    console.error = (...args) => {
      output += 'ERROR: ' + args.join(' ') + '\n';
      originalError(...args);
    };
    
    try {
      const success = runAllTests();
      testResults = output;
      parserStatus = success ? 'All tests passed!' : 'Some tests failed';
    } catch (error) {
      testResults = output + '\nUnexpected error: ' + error;
      parserStatus = 'Tests failed with error';
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  }
</script>

<main class="min-h-screen bg-pmac-bg-primary text-pmac-text-primary">
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-pmac-text-primary mb-2">
        {$projectTitle}
      </h1>
      <p class="text-pmac-text-secondary">
        Dark mode visualization tool for PMaC project backlogs
      </p>
    </header>
    
    {#if isLoading}
      <div class="flex items-center justify-center min-h-64">
        <div class="spinner"></div>
        <span class="ml-4 text-pmac-text-secondary">Loading project backlog...</span>
      </div>
    {:else if error}
      <div class="card p-6 max-w-2xl border-red-500/20 bg-red-600/10 mb-6">
        <h2 class="text-xl font-semibold mb-2 text-red-400">Error Loading Backlog</h2>
        <p class="text-red-300 mb-4">{error}</p>
        <p class="text-pmac-text-secondary text-sm">Using sample data for demonstration.</p>
      </div>
    {/if}
    
    {#if backlog}
      <!-- Project Statistics -->
      <StatsPanel />
      
      <!-- Filter Panel -->
      <FilterPanel />
      
      <!-- Project Overview -->
      <div class="card card-hover p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4 text-pmac-text-primary">
          Project Overview
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-medium text-pmac-text-secondary mb-2">Metadata</h3>
            <div class="space-y-1 text-sm">
              <p><span class="text-pmac-text-muted">Version:</span> {backlog.metadata.version}</p>
              <p><span class="text-pmac-text-muted">Last Updated:</span> {backlog.metadata.last_updated}</p>
              <p><span class="text-pmac-text-muted">Current Sprint:</span> {backlog.metadata.current_sprint}</p>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-pmac-text-secondary mb-2">Statistics</h3>
            <div class="space-y-1 text-sm">
              {#if backlog.epic_summary}
                <p><span class="text-pmac-text-muted">Total Hours:</span> {backlog.epic_summary.total_estimated_hours}</p>
                <p><span class="text-pmac-text-muted">Duration:</span> {backlog.epic_summary.estimated_duration}</p>
              {/if}
              <p><span class="text-pmac-text-muted">Phases:</span> {Object.keys(backlog.phases).length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Filtered Tasks -->
      <div class="card card-hover p-6 mb-6">
        <h3 class="text-lg font-semibold text-pmac-text-primary mb-4">
          Tasks ({$filteredTasks.length})
        </h3>
        
        {#if $filteredTasks.length === 0}
          <div class="text-center py-8">
            <p class="text-pmac-text-secondary">No tasks match the current filters.</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each $filteredTasks as task}
              <div class="bg-pmac-bg-tertiary p-4 rounded border border-gray-700">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-mono text-pmac-text-muted">{task.id}</span>
                    <span class="text-pmac-text-primary font-medium">{task.title}</span>
                    <span class="text-xs px-2 py-1 rounded bg-gray-700 text-pmac-text-muted">
                      {task.phaseTitle}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="{TASK_STATUS_COLORS[task.status]} px-2 py-1 rounded text-xs border capitalize">
                      {task.status.replace('_', ' ')}
                    </span>
                    <span class="{TASK_PRIORITY_COLORS[task.priority]} px-2 py-1 rounded text-xs border capitalize">
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                <div class="text-xs text-pmac-text-muted mb-2">
                  <span>Estimated: {task.estimated_hours}h</span>
                  {#if task.actual_hours}
                    <span class="ml-4">Actual: {task.actual_hours}h</span>
                  {/if}
                  {#if task.assignee}
                    <span class="ml-4">Assignee: {task.assignee}</span>
                  {/if}
                </div>
                
                {#if task.requirements.length > 0}
                  <div class="text-xs mb-2">
                    <span class="text-pmac-text-secondary font-medium">Requirements:</span>
                    <ul class="mt-1 ml-4 space-y-1">
                      {#each task.requirements as requirement}
                        <li class="text-pmac-text-muted">• {requirement}</li>
                      {/each}
                    </ul>
                  </div>
                {/if}
                
                {#if task.dependencies.length > 0 || task.blocks.length > 0}
                  <div class="text-xs text-pmac-text-muted">
                    {#if task.dependencies.length > 0}
                      <span>Dependencies: {task.dependencies.join(', ')}</span>
                    {/if}
                    {#if task.blocks.length > 0}
                      <span class="ml-4">Blocks: {task.blocks.join(', ')}</span>
                    {/if}
                  </div>
                {/if}
                
                {#if task.notes.length > 0}
                  <div class="text-xs mt-2">
                    <span class="text-pmac-text-secondary font-medium">Notes:</span>
                    <ul class="mt-1 space-y-1">
                      {#each task.notes as note}
                        <li class="text-pmac-text-muted">• {note}</li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
      
      <!-- Risks (if available) -->
      {#if backlog.risks}
        <div class="card card-hover p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 text-pmac-text-primary">Risk Assessment</h3>
          {#each Object.entries(backlog.risks) as [level, risks]}
            <div class="mb-4">
              <h4 class="text-sm font-medium text-pmac-text-secondary mb-2 capitalize">{level} Risk</h4>
              <div class="space-y-2">
                {#each risks as risk}
                  <div class="bg-pmac-bg-tertiary p-3 rounded border border-gray-700">
                    <p class="text-sm text-pmac-text-primary mb-1">{risk.risk}</p>
                    <p class="text-xs text-pmac-text-muted"><span class="font-medium">Mitigation:</span> {risk.mitigation}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
    
    <!-- YAML Parser Testing -->
    <div class="card card-hover p-6 max-w-2xl">
      <h2 class="text-xl font-semibold mb-4 text-pmac-text-primary">
        YAML Parser Testing
      </h2>
      <p class="text-pmac-text-secondary mb-4">
        Test the PMaC backlog YAML parser with validation and error handling.
      </p>
      
      <div class="flex items-center gap-4 mb-4">
        <button 
          class="btn-primary"
          on:click={runParserTests}
          disabled={parserStatus === 'Running tests...'}
        >
          {parserStatus === 'Running tests...' ? 'Running...' : 'Run Parser Tests'}
        </button>
        <span class="text-sm text-pmac-text-secondary">
          Status: {parserStatus}
        </span>
      </div>
      
      {#if testResults}
        <div class="bg-pmac-bg-tertiary p-4 rounded-md">
          <h3 class="text-sm font-semibold mb-2 text-pmac-text-primary">Test Results:</h3>
          <pre class="text-xs text-pmac-text-secondary whitespace-pre-wrap font-mono scrollbar-dark max-h-64 overflow-y-auto">{testResults}</pre>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  /* Component-specific styles if needed */
</style>