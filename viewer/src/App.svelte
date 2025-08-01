<script lang="ts">
  // PMaC Backlog Viewer - Root Application Component
  import type { ProjectBacklog, TaskWithPhase } from './lib/types';
  import { parseBacklogYaml } from './lib/parseBacklog';
  import {
    appState,
    projectTitle,
    filteredTasks,
    tasksByPhase,
    projectStats,
    selectedTask,
    isTaskDetailOpen,
    loadBacklog,
    setLoading,
    setError,
    loadUserPreferences,
    saveUserPreferences,
    openTaskDetail,
    closeTaskDetail,
    filterState,
    setPhaseFilter,
    allTasks,
  } from './lib/stores';
  import FilterPanel from './components/FilterPanel.svelte';
  import PhaseGroup from './components/PhaseGroup.svelte';
  import TaskDetail from './components/TaskDetail.svelte';
  import CriticalPath from './components/CriticalPath.svelte';
  import BacklogOverview from './components/BacklogOverview.svelte';
  import ErrorDisplay from './components/ErrorDisplay.svelte';
  import { getEnvironmentConfig, findBacklogFile } from './lib/config';
  import { onMount, onDestroy } from 'svelte';

  // Subscribe to reactive stores
  $: isLoading = $appState.isLoading;
  $: backlog = $appState.backlog;
  $: error = $appState.error;

  // Mobile sidebar toggle
  let mobileMenuOpen = false;
  
  // Collapsible sections
  let criticalPathExpanded = false;

  // Task interaction
  function handleTaskClick(task: TaskWithPhase) {
    openTaskDetail(task);
  }

  // Parser testing
  let testResults = '';
  let parserStatus = 'Ready to test';

  // Configuration
  let config = getEnvironmentConfig();
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let currentBacklogPath = '';

  // Load backlog from API endpoint or configured path
  async function loadBacklogData(isRefresh = false) {
    // Only show loading spinner for initial load, not for refresh
    if (!isRefresh) {
      setLoading(true);
    }

    try {
      let yamlContent: string;
      
      // Try API endpoint first (for packaged mode)
      try {
        const apiResponse = await fetch('/api/backlog');
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          yamlContent = apiData.content;
          currentBacklogPath = apiData.path || 'API endpoint';
        } else {
          throw new Error('API endpoint not available');
        }
      } catch (_apiError) {
        // Fall back to direct file access (for development mode)
        currentBacklogPath = await findBacklogFile(config.backlogPath);
        const response = await fetch(currentBacklogPath);

        if (!response.ok) {
          throw new Error(`Failed to load backlog from ${currentBacklogPath}: ${response.status}`);
        }

        yamlContent = await response.text();
      }
      const parseResult = parseBacklogYaml(yamlContent, { 
        validateSchema: true, 
        strict: false, 
        allowPartial: true 
      });

      if (parseResult.success && parseResult.data) {
        loadBacklog(parseResult.data);
        
        // Show warnings if in partial mode
        if (parseResult.warnings && parseResult.warnings.length > 0) {
          console.warn('Backlog loaded with warnings:', parseResult.warnings);
          // Store warnings for display
          appState.update((state) => ({ ...state, warnings: parseResult.warnings }));
        } else {
          setError(null);
        }
      } else {
        // Include context and warnings in error
        const errorMessage = parseResult.error || 'Failed to parse backlog YAML';
        const contextInfo = parseResult.context ? ` (${parseResult.context})` : '';
        throw new Error(errorMessage + contextInfo);
      }
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Unknown error loading backlog';
      
      // Enhance network errors
      if (err instanceof Error && err.message.includes('Failed to load backlog')) {
        errorMessage = `Network error: Could not load backlog from ${currentBacklogPath}. Please check your connection and file path.`;
      }
      
      setError(errorMessage);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }

  // Setup auto-refresh if enabled
  function setupAutoRefresh() {
    if (config.enableAutoRefresh && config.refreshInterval > 0) {
      refreshInterval = setInterval(() => loadBacklogData(true), config.refreshInterval);
    }
  }

  // Initialize app
  onMount(async () => {
    // Load user preferences
    loadUserPreferences();
    saveUserPreferences();

    // Load backlog data
    await loadBacklogData();

    // Setup auto-refresh
    setupAutoRefresh();
  });

  // Cleanup
  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });


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
      // Run basic parser tests inline
      console.log('Running YAML parser tests...');

      // Test 1: Valid YAML parsing
      const testYaml = `
metadata:
  project: "Test Project"
  version: "1.0.0"
  last_updated: "2025-01-15"
  current_sprint: "test"
  pmac_methodology: "test.md"
  technical_requirements: "test.md"
  decision_log: "test.md"
  ai_instructions: "test.md"
phases:
  test:
    title: "Test Phase"
    description: "Test description"
    status: "active"
    estimated_duration: "1 week"
    tasks:
      - id: "TEST-001"
        title: "Test Task"
        status: "ready"
        priority: "medium"
        estimated_hours: 4
        requirements: ["Test requirement"]
        dependencies: []
        blocks: []
        notes: []
      `;

      const result = parseBacklogYaml(testYaml);
      if (result.success) {
        console.log('✓ Valid YAML parsing test passed');
      } else {
        console.log('✗ Valid YAML parsing test failed:', result.error);
      }

      // Test 2: Invalid YAML handling
      const invalidResult = parseBacklogYaml('invalid: yaml: content: [[[');
      if (!invalidResult.success) {
        console.log('✓ Invalid YAML handling test passed');
      } else {
        console.log('✗ Invalid YAML handling test failed');
      }

      // Test 3: Empty content handling
      const emptyResult = parseBacklogYaml('');
      if (!emptyResult.success) {
        console.log('✓ Empty content handling test passed');
      } else {
        console.log('✗ Empty content handling test failed');
      }

      console.log('✅ Basic parser tests completed');

      testResults = output;
      parserStatus = 'Basic tests completed!';
    } catch (error) {
      testResults = output + '\nUnexpected error: ' + error;
      parserStatus = 'Tests failed with error';
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  }
</script>

<main class="min-h-screen bg-gray-900 text-gray-100 flex overflow-x-hidden w-full">
  <!-- Mobile menu overlay -->
  {#if mobileMenuOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      role="button"
      tabindex="0"
      on:click={() => (mobileMenuOpen = false)}
      on:keydown={(e) => e.key === 'Escape' && (mobileMenuOpen = false)}
    ></div>
  {/if}

  <!-- Sidebar Navigation -->
  <aside
    class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0 {mobileMenuOpen
      ? 'fixed inset-y-0 left-0 z-50 md:relative md:z-auto'
      : 'hidden md:flex'}"
  >
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-gray-700 min-w-0">
      <h2 class="text-lg font-semibold text-gray-100 truncate">
        {$projectTitle}
      </h2>
      <p class="text-xs text-gray-400 mt-1 truncate">Visualize your project's backlog</p>
    </div>

    <!-- Phase Navigation -->
    <nav class="flex-1 p-4">
      <h3 class="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wide">Phases</h3>
      {#if backlog}
        <ul class="space-y-1">
          <!-- All Phases Option -->
          <li>
            <button
              class="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors
                     {$filterState.phase === null
                ? 'bg-gray-700 text-blue-400'
                : 'text-gray-300'}"
              on:click={() => {
                // Clear phase filter to show all tasks
                setPhaseFilter(null);
                // Update app state selection for UI highlighting
                appState.update((state) => ({
                  ...state,
                  viewState: { ...state.viewState, selection: { ...state.viewState.selection, selectedPhase: null } },
                }));
              }}
            >
              <div class="flex items-center justify-between">
                <span>All Phases</span>
                <span class="text-xs text-gray-400">
                  {$allTasks.length}
                </span>
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {Math.round($projectStats.completionPercentage)}% complete
              </div>
            </button>
          </li>
          {#each Object.entries(backlog.phases) as [phaseId, phase]}
            <li>
              <button
                class="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors
                       {$filterState.phase === phaseId
                  ? 'bg-gray-700 text-blue-400'
                  : 'text-gray-300'}"
                on:click={() => {
                  // Update filter state to show only tasks from this phase
                  setPhaseFilter(phaseId);
                  // Update app state selection for UI highlighting
                  appState.update((state) => ({
                    ...state,
                    viewState: { ...state.viewState, selection: { ...state.viewState.selection, selectedPhase: phaseId } },
                  }));
                }}
              >
                <div class="flex items-center justify-between">
                  <span>{phase.title}</span>
                  <span class="text-xs text-gray-400">
                    {phase.tasks.length}
                  </span>
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {phase.status}
                </div>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <!-- Skeleton loading state -->
        <ul class="space-y-1">
          {#each Array(5) as _, i}
            <li>
              <div class="px-3 py-2 rounded-md">
                <div class="flex items-center justify-between">
                  <div class="h-4 bg-gray-700 rounded animate-pulse" style="width: {60 + (i * 10)}%"></div>
                  <div class="h-3 bg-gray-700 rounded animate-pulse w-6"></div>
                </div>
                <div class="h-3 bg-gray-700 rounded animate-pulse w-12 mt-2"></div>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </nav>

    <!-- Sidebar Footer -->
    <div class="p-4 border-t border-gray-700">
      <div class="text-xs text-gray-400">
        {#if backlog}
          <div class="mb-2">
            Version: {backlog.metadata.version}
          </div>
          <div>
            Updated: {backlog.metadata.last_updated}
          </div>
        {/if}
      </div>
    </div>
  </aside>

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col min-w-0">
    <!-- Main Header -->
    <header class="bg-gray-800 border-b border-gray-700 p-4 min-w-0">
      <div class="flex items-center justify-between min-w-0">
        <div class="flex items-center min-w-0 flex-1">
          <!-- Mobile menu button -->
          <button
            class="md:hidden mr-4 p-2 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 flex-shrink-0"
            on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          <div class="min-w-0 flex-1">
            <h1 class="text-xl font-bold text-gray-100 truncate">
              {$projectTitle}
            </h1>
            <p class="text-gray-400 text-sm truncate">
              Visualization tool for PMaC project backlogs
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {#if currentBacklogPath}
            <div class="text-xs text-gray-500 hidden lg:block truncate max-w-48">
              Loading from: {currentBacklogPath}
            </div>
          {/if}
          {#if backlog}
            <div class="text-sm text-gray-400 hidden sm:block whitespace-nowrap">
              {Object.keys(backlog.phases).length} phases
            </div>
            <div class="text-sm text-gray-400 whitespace-nowrap">
              {$filteredTasks.length} tasks
            </div>
            <!-- Subtle refresh indicator -->
            <div class="flex items-center space-x-2 flex-shrink-0">
              <div class="w-2 h-2 bg-green-500 rounded-full {isLoading ? 'animate-pulse' : ''}"></div>
              <span class="text-xs text-gray-500 whitespace-nowrap">Live</span>
            </div>
          {/if}
          {#if config.enableAutoRefresh}
            <div class="text-xs text-green-500 hidden lg:block whitespace-nowrap">
              Auto-refresh: {config.refreshInterval / 1000}s
            </div>
          {/if}

          <!-- Manual refresh button -->
          <button
            class="text-gray-400 hover:text-gray-100 p-1 rounded-md hover:bg-gray-700 transition-colors"
            on:click={() => loadBacklogData(true)}
            disabled={isLoading}
            title="Refresh backlog data"
          >
            <svg
              class="w-4 h-4 {isLoading ? 'animate-spin' : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8.002 8.002 0 0115.356 2M15 15v5h-.582M8.05 21.418A8.001 8.001 0 0019.418 15m0 0V15a8.002 8.002 0 00-15.356-2"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden">
      <div class="p-4 sm:p-6 max-w-full min-w-0">
        {#if isLoading && !backlog}
          <div class="flex items-center justify-center min-h-64">
            <div class="spinner"></div>
            <span class="ml-4 text-gray-400">Loading project backlog...</span>
          </div>
        {:else if error && !backlog}
          <ErrorDisplay 
            {error} 
            context="Loading backlog"
            onRetry={() => loadBacklogData()}
          />
        {:else if backlog}
          <!-- Backlog Overview -->
          <div class="mb-6">
            <BacklogOverview />
          </div>

          <!-- Filter Panel -->
          <FilterPanel />

          <!-- Critical Path Visualization -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg mb-6 overflow-hidden">
            <header
              class="p-4 bg-gray-750 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
              on:click={() => criticalPathExpanded = !criticalPathExpanded}
              on:keydown={(e) => e.key === 'Enter' && (criticalPathExpanded = !criticalPathExpanded)}
              tabindex="0"
              role="button"
              aria-expanded={criticalPathExpanded}
              aria-controls="critical-path-content"
            >
              <div class="flex items-center gap-3">
                <!-- Collapse/Expand Icon -->
                <svg
                  class="w-5 h-5 text-gray-400 transition-transform duration-200 {criticalPathExpanded ? 'rotate-90' : ''}"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>

                <!-- Section Title -->
                <h2 class="text-xl font-semibold text-gray-100">
                  Critical Path Analysis
                </h2>
              </div>
            </header>
            
            {#if criticalPathExpanded}
              <div id="critical-path-content" class="p-6">
                <CriticalPath tasks={$filteredTasks} on:taskSelect={(e) => handleTaskClick(e.detail.task)} />
              </div>
            {/if}
          </div>

          <!-- Phase Groups -->
          {#if $tasksByPhase.size === 0}
            <div class="text-center py-12">
              <p class="text-gray-400 text-lg">No phases found in the project backlog.</p>
            </div>
          {:else}
            {#each Object.entries(backlog.phases) as [phaseId, phase]}
              {#if $tasksByPhase.has(phaseId)}
                <PhaseGroup
                  {phaseId}
                  {phase}
                  tasks={$tasksByPhase.get(phaseId) || []}
                  stats={$projectStats.phaseStats[phaseId] || {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    pending: 0,
                    blocked: 0,
                    totalHours: 0,
                    completedHours: 0,
                  }}
                  onTaskClick={handleTaskClick}
                />
              {/if}
            {/each}
          {/if}

          <!-- Risks (if available) -->
          {#if backlog.risks}
            <div
              class="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 hover:bg-gray-700 transition-colors"
            >
              <h3 class="text-lg font-semibold mb-4 text-gray-100">Risk Assessment</h3>
              {#each Object.entries(backlog.risks) as [level, risks]}
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-300 mb-2 capitalize">{level} Risk</h4>
                  <div class="space-y-2">
                    {#each risks as risk}
                      <div class="bg-gray-700 p-3 rounded border border-gray-600">
                        <p class="text-sm text-gray-100 mb-1">{risk.risk}</p>
                        <p class="text-xs text-gray-400">
                          <span class="font-medium">Mitigation:</span>
                          {risk.mitigation}
                        </p>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        {/if}

        <!-- YAML Parser Testing -->
        <div
          class="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl hover:bg-gray-700 transition-colors"
        >
          <h2 class="text-xl font-semibold mb-4 text-gray-100">YAML Parser Testing</h2>
          <p class="text-gray-400 mb-4">
            Test the PMaC backlog YAML parser with validation and error handling.
          </p>

          <div class="flex items-center gap-4 mb-4">
            <button
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              on:click={runParserTests}
              disabled={parserStatus === 'Running tests...'}
            >
              {parserStatus === 'Running tests...' ? 'Running...' : 'Run Parser Tests'}
            </button>
            <span class="text-sm text-gray-400">
              Status: {parserStatus}
            </span>
          </div>

          {#if testResults}
            <div class="bg-gray-700 p-4 rounded-md">
              <h3 class="text-sm font-semibold mb-2 text-gray-100">Test Results:</h3>
              <pre
                class="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">{testResults}</pre>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>

<!-- Task Detail Modal -->
{#if $isTaskDetailOpen && $selectedTask}
  <TaskDetail task={$selectedTask} isOpen={$isTaskDetailOpen} on:close={closeTaskDetail} />
{/if}

<style>
  /* Component-specific styles if needed */
</style>
