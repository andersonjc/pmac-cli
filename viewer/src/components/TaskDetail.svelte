<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { TaskWithPhase } from '../lib/types';
  import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from '../lib/types';

  export let task: TaskWithPhase;
  export let isOpen = false;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  // Handle modal close
  function closeModal() {
    dispatch('close');
  }

  // Handle ESC key globally when modal is open
  function handleDocumentKeydown(event: KeyboardEvent) {
    if (isOpen && event.key === 'Escape') {
      closeModal();
    }
  }

  // Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  // Handle backdrop keyboard events
  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    }
  }


  // Simple syntax highlighting for code blocks
  function highlightCode(text: string): string {
    // Basic highlighting for common patterns
    return text
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)\n```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  // Get effective status (considering dependencies)
  $: effectiveStatus = task.effectiveStatus || task.status;
  
  // Format progress percentage
  $: progressPercentage =
    task.actual_hours && task.estimated_hours
      ? Math.min((task.actual_hours / task.estimated_hours) * 100, 100)
      : effectiveStatus === 'completed'
        ? 100
        : 0;

  // Format status text
  $: statusText =
    effectiveStatus === 'in_progress' ? 'in progress' : effectiveStatus.replace('_', ' ').toLowerCase();
  
  // Check if task is blocked due to dependencies
  $: isBlockedByDependencies = effectiveStatus === 'blocked' && task.status !== 'blocked';

  // Handle ESC key globally when modal is open
  onMount(() => {
    document.addEventListener('keydown', handleDocumentKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleDocumentKeydown);
  });
</script>

<!-- Modal backdrop -->
{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    on:click={handleBackdropClick}
    on:keydown={handleBackdropKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="task-title"
  >
    <!-- Modal content -->
    <div
      class="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto min-w-0"
    >
      <!-- Modal header -->
      <header class="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm font-mono text-gray-400 shrink-0">{task.id}</span>
              <h1 id="task-title" class="text-xl font-semibold text-gray-100">
                {task.title}
              </h1>
            </div>

            <div class="flex items-center gap-3 text-sm">
              <span class="px-2 py-1 rounded bg-gray-700 text-gray-300">
                {task.phaseTitle}
              </span>

              <!-- Status Badge -->
              <span
                class="{TASK_STATUS_COLORS[
                  effectiveStatus
                ]} px-2 py-1 rounded text-xs border capitalize"
              >
                {statusText}
                {#if isBlockedByDependencies}
                  <svg class="w-3 h-3 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </span>

              <!-- Priority Badge -->
              <span
                class="{TASK_PRIORITY_COLORS[
                  task.priority
                ]} px-2 py-1 rounded text-xs border capitalize"
              >
                {task.priority}
              </span>
            </div>
          </div>

          <!-- Close button -->
          <button
            class="text-gray-400 hover:text-gray-100 p-2 hover:bg-gray-700 rounded-md transition-colors"
            on:click={closeModal}
            aria-label="Close modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </header>

      <!-- Modal body -->
      <div class="p-6 space-y-6">
        <!-- Task metadata -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Time tracking -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-100">Time & Progress</h3>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-400">Estimated Hours:</span>
                <span class="text-gray-100">{task.estimated_hours}h</span>
              </div>

              {#if task.actual_hours}
                <div class="flex justify-between">
                  <span class="text-gray-400">Actual Hours:</span>
                  <span class="text-gray-100">{task.actual_hours}h</span>
                </div>
              {/if}

              {#if task.assignee}
                <div class="flex justify-between">
                  <span class="text-gray-400">Assignee:</span>
                  <span class="text-gray-100">@{task.assignee}</span>
                </div>
              {/if}
            </div>

            <!-- Progress bar -->
            {#if progressPercentage > 0}
              <div>
                <div class="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-3">
                  <div
                    class="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style="width: {progressPercentage}%"
                  ></div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Dependencies -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-100">Dependencies</h3>

            {#if task.dependencies && task.dependencies.length > 0}
              <div>
                <h4 class="text-sm font-medium text-orange-400 mb-2">Depends on:</h4>
                <div class="flex flex-wrap gap-2">
                  {#each task.dependencies as dep}
                    <span
                      class="px-2 py-1 bg-orange-900/30 text-orange-300 text-xs rounded border border-orange-500/30"
                    >
                      {dep}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}

            {#if task.blocks && task.blocks.length > 0}
              <div>
                <h4 class="text-sm font-medium text-red-400 mb-2">Blocks:</h4>
                <div class="flex flex-wrap gap-2">
                  {#each task.blocks as block}
                    <span
                      class="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded border border-red-500/30"
                    >
                      {block}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}

            {#if (!task.dependencies || task.dependencies.length === 0) && (!task.blocks || task.blocks.length === 0)}
              <p class="text-gray-400 text-sm">No dependencies or blocking relationships</p>
            {/if}
          </div>
        </div>

        <!-- Requirements -->
        {#if task.requirements && task.requirements.length > 0}
          <div>
            <h3 class="text-lg font-medium text-gray-100 mb-3">Requirements</h3>
            <ul class="space-y-2">
              {#each task.requirements as requirement}
                <li class="flex items-start gap-2">
                  <span class="text-blue-400 mt-1 text-sm">•</span>
                  <span class="text-gray-300">{@html highlightCode(requirement)}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Acceptance Criteria -->
        {#if task.acceptance_criteria && task.acceptance_criteria.length > 0}
          <div>
            <h3 class="text-lg font-medium text-gray-100 mb-3">Acceptance Criteria</h3>
            <ul class="space-y-2">
              {#each task.acceptance_criteria as criteria}
                <li class="flex items-start gap-2">
                  <svg
                    class="w-4 h-4 text-green-400 mt-0.5 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="text-gray-300">{@html highlightCode(criteria)}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Notes -->
        {#if task.notes && task.notes.length > 0}
          <div>
            <h3 class="text-lg font-medium text-gray-100 mb-3">Notes & History</h3>
            <div class="space-y-3 max-h-60 overflow-y-auto">
              {#each task.notes as note}
                <div class="bg-gray-750 p-3 rounded border border-gray-600">
                  <p class="text-gray-300 text-sm">{@html highlightCode(note)}</p>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Modal footer -->
      <footer class="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6">
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-md transition-colors"
            on:click={closeModal}
          >
            Close
          </button>
        </div>
      </footer>
    </div>
  </div>
{/if}

<style>
  .bg-gray-750 {
    background-color: rgb(55, 65, 81);
  }

  :global(.inline-code) {
    background-color: rgb(55, 65, 81);
    color: rgb(96, 165, 250);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-size: 0.875em;
  }

  :global(.code-block) {
    background-color: rgb(31, 41, 55);
    border: 1px solid rgb(75, 85, 99);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  :global(.code-block code) {
    color: rgb(156, 163, 175);
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
</style>
