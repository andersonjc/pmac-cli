<script lang="ts">
  // PMaC Backlog Viewer - Root Application Component
  let projectTitle = "PMaC Backlog Viewer"
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
      
      <!-- Status indicator test -->
      <div class="flex gap-2 mb-4">
        <span class="status-completed px-2 py-1 rounded text-xs border">Completed</span>
        <span class="status-in-progress px-2 py-1 rounded text-xs border">In Progress</span>
        <span class="status-pending px-2 py-1 rounded text-xs border">Pending</span>
        <span class="status-blocked px-2 py-1 rounded text-xs border">Blocked</span>
      </div>
      
      <!-- Priority indicator test -->
      <div class="flex gap-2">
        <span class="priority-critical px-2 py-1 rounded text-xs border">Critical</span>
        <span class="priority-high px-2 py-1 rounded text-xs border">High</span>
        <span class="priority-medium px-2 py-1 rounded text-xs border">Medium</span>
        <span class="priority-low px-2 py-1 rounded text-xs border">Low</span>
      </div>
    </div>
  </div>
</main>

<style>
  /* Component-specific styles if needed */
</style>