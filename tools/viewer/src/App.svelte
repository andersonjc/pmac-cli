<script lang="ts">
  // PMaC Backlog Viewer - Root Application Component
  import type { TaskStatus, TaskPriority, AppState } from './lib/types';
  import { DEFAULT_APP_STATE, TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from './lib/types';
  
  let projectTitle = "PMaC Backlog Viewer"
  let appState: AppState = DEFAULT_APP_STATE;
  
  // Demo data using our types
  const demoStatuses: TaskStatus[] = ['completed', 'in_progress', 'ready', 'blocked'];
  const demoPriorities: TaskPriority[] = ['critical', 'high', 'medium', 'low'];
</script>

<main class="min-h-screen bg-pmac-bg-primary text-pmac-text-primary">
  <div class="container mx-auto px-4 py-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-pmac-text-primary mb-2">
        {projectTitle}
      </h1>
      <p class="text-pmac-text-secondary">
        Dark mode visualization tool for PMaC project backlogs
      </p>
    </header>
    
    <div class="card card-hover p-6 max-w-md">
      <h2 class="text-xl font-semibold mb-4 text-pmac-text-primary">
        Project Setup Complete
      </h2>
      <p class="text-pmac-text-secondary mb-4">
        Basic project structure initialized with dark mode support.
      </p>
      
      <!-- Status indicator test with TypeScript types -->
      <div class="flex gap-2 mb-4">
        {#each demoStatuses as status}
          <span class="{TASK_STATUS_COLORS[status]} px-2 py-1 rounded text-xs border capitalize">
            {status.replace('_', ' ')}
          </span>
        {/each}
      </div>
      
      <!-- Priority indicator test with TypeScript types -->
      <div class="flex gap-2 mb-4">
        {#each demoPriorities as priority}
          <span class="{TASK_PRIORITY_COLORS[priority]} px-2 py-1 rounded text-xs border capitalize">
            {priority}
          </span>
        {/each}
      </div>
      
      <!-- App state indicator -->
      <div class="text-sm text-pmac-text-muted">
        <p>Loading: {appState.isLoading}</p>
        <p>Error: {appState.error ?? 'none'}</p>
        <p>Backlog loaded: {appState.backlog ? 'yes' : 'no'}</p>
      </div>
    </div>
  </div>
</main>

<style>
  /* Component-specific styles if needed */
</style>