<script lang="ts">
  import type { TaskWithPhase } from '../lib/types';
  import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from '../lib/types';

  export let task: TaskWithPhase;
  export let onClick: ((task: TaskWithPhase) => void) | undefined = undefined;

  // Calculate progress percentage
  $: progressPercentage =
    task.actual_hours && task.estimated_hours
      ? Math.min((task.actual_hours / task.estimated_hours) * 100, 100)
      : task.status === 'completed'
        ? 100
        : 0;

  // Format status text for display
  $: statusText =
    task.status === 'in_progress' ? 'in progress' : task.status.replace('_', ' ').toLowerCase();

  // Handle click
  function handleClick() {
    if (onClick) {
      onClick(task);
    }
  }

  // Format dependencies and blocks
  $: hasDependencies = task.dependencies && task.dependencies.length > 0;
  $: hasBlocks = task.blocks && task.blocks.length > 0;
</script>

<article
  class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
  on:click={handleClick}
  on:keydown={e => e.key === 'Enter' && handleClick()}
  tabindex="0"
  role="button"
>
  <!-- Header with ID, Status, Priority, Title, and Phase -->
  <header class="mb-3">
    <!-- First row: Task ID and Status/Priority badges -->
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-mono text-gray-400 shrink-0">{task.id}</span>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Status Badge -->
        <span class="{TASK_STATUS_COLORS[task.status]} px-2 py-1 rounded text-xs border capitalize">
          {statusText}
        </span>

        <!-- Priority Badge -->
        <span
          class="{TASK_PRIORITY_COLORS[task.priority]} px-2 py-1 rounded text-xs border capitalize"
        >
          {task.priority}
        </span>
      </div>
    </div>

    <!-- Second row: Task title -->
    <div class="mb-2">
      <h3 class="text-gray-100 font-medium">{task.title}</h3>
    </div>

    <!-- Third row: Phase -->
    <div class="flex items-center gap-2 text-xs">
      <span class="px-2 py-1 rounded bg-gray-700 text-gray-300">
        {task.phaseTitle}
      </span>
    </div>
  </header>

  <!-- Progress Bar -->
  {#if progressPercentage > 0}
    <div class="mb-3">
      <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
        <span>Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style="width: {progressPercentage}%"
        ></div>
      </div>
    </div>
  {/if}

  <!-- Hours and Assignee -->
  <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
    <div class="flex items-center gap-4">
      <span>Est: {task.estimated_hours}h</span>
      {#if task.actual_hours}
        <span>Act: {task.actual_hours}h</span>
      {/if}
    </div>
    {#if task.assignee}
      <span class="text-gray-300">@{task.assignee}</span>
    {/if}
  </div>

  <!-- Requirements Preview -->
  {#if task.requirements && task.requirements.length > 0}
    <div class="mb-3">
      <h4 class="text-xs font-medium text-gray-300 mb-1">Requirements:</h4>
      <ul class="text-xs text-gray-400 space-y-1">
        {#each task.requirements.slice(0, 3) as requirement}
          <li class="flex items-start gap-1">
            <span class="text-gray-500 mt-0.5">•</span>
            <span class="line-clamp-1">{requirement}</span>
          </li>
        {/each}
        {#if task.requirements.length > 3}
          <li class="text-gray-500 italic">+{task.requirements.length - 3} more...</li>
        {/if}
      </ul>
    </div>
  {/if}

  <!-- Dependencies and Blocks -->
  {#if hasDependencies || hasBlocks}
    <div class="border-t border-gray-700 pt-3">
      <div class="flex items-center gap-4 text-xs">
        {#if hasDependencies}
          <div class="flex items-center gap-1">
            <svg class="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-orange-400">
              Depends on: {task.dependencies.join(', ')}
            </span>
          </div>
        {/if}

        {#if hasBlocks}
          <div class="flex items-center gap-1">
            <svg class="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-red-400">
              Blocks: {task.blocks.join(', ')}
            </span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Hover Effect Indicator -->
  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  </div>
</article>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
