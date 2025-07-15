<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { Phase, TaskWithPhase, PhaseStats } from '../lib/types';
  import TaskCard from './TaskCard.svelte';

  export let phaseId: string;
  export let phase: Phase;
  export let tasks: TaskWithPhase[];
  export let stats: PhaseStats;
  export let onTaskClick: ((_task: TaskWithPhase) => void) | undefined = undefined;

  import { collapsedPhases, togglePhaseCollapse } from '../lib/stores';

  // Reactive collapsed state
  $: isCollapsed = $collapsedPhases.has(phaseId);

  // Calculate progress percentage
  $: progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // Handle collapse toggle
  function handleCollapseToggle() {
    togglePhaseCollapse(phaseId);
  }

  // Handle task click
  function handleTaskClick(clickedTask: TaskWithPhase) {
    if (onTaskClick) {
      onTaskClick(clickedTask);
    }
  }

  // Format phase status for display
  $: formattedStatus = phase.status.replace('_', ' ').toLowerCase();
</script>

<div class="bg-gray-800 border border-gray-700 rounded-lg mb-6 overflow-hidden">
  <!-- Phase Header -->
  <header
    class="p-4 bg-gray-750 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
    on:click={handleCollapseToggle}
    on:keydown={e => e.key === 'Enter' && handleCollapseToggle()}
    tabindex="0"
    role="button"
    aria-expanded={!isCollapsed}
    aria-controls="phase-{phaseId}-content"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <!-- Collapse/Expand Icon -->
          <svg
            class="w-5 h-5 text-gray-400 transition-transform duration-200 {isCollapsed
              ? ''
              : 'rotate-90'}"
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

          <!-- Phase Title -->
          <h2 class="text-xl font-semibold text-gray-100 truncate">
            {phase.title}
          </h2>

          <!-- Phase ID Badge -->
          <span class="px-2 py-1 bg-gray-600 text-gray-300 text-xs font-mono rounded">
            {phaseId}
          </span>
        </div>

        <!-- Phase Description -->
        <p class="text-sm text-gray-400 mb-3 line-clamp-2">
          {phase.description}
        </p>

        <!-- Phase Metadata -->
        <div class="flex items-center gap-4 text-xs text-gray-400">
          <span class="capitalize">Status: {formattedStatus}</span>
          <span>Duration: {phase.estimated_duration}</span>
          <span>Tasks: {stats.total}</span>
          <span>Hours: {stats.totalHours}</span>
        </div>
      </div>

      <!-- Phase Statistics -->
      <div class="flex items-center gap-4 shrink-0 ml-4">
        <!-- Task Count Breakdown -->
        <div class="text-right">
          <div class="text-sm font-medium text-gray-100">
            {stats.completed}/{stats.total} Complete
          </div>
          <div class="text-xs text-gray-400">
            {Math.round(progressPercentage)}% done
          </div>
        </div>

        <!-- Progress Ring -->
        <div class="relative w-12 h-12">
          <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <!-- Background circle -->
            <path
              class="text-gray-700"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
              d="M18 3 a15 15 0 0 1 0 30 a15 15 0 0 1 0 -30"
            />
            <!-- Progress circle -->
            <path
              class="text-blue-500"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-dasharray="{progressPercentage}, 100"
              d="M18 3 a15 15 0 0 1 0 30 a15 15 0 0 1 0 -30"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xs font-medium text-gray-100">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-3">
      <div class="w-full bg-gray-700 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style="width: {progressPercentage}%"
        ></div>
      </div>
    </div>
  </header>

  <!-- Phase Content (Collapsible) -->
  {#if !isCollapsed}
    <div id="phase-{phaseId}-content" class="p-4" transition:slide|local={{ duration: 200 }}>
      <!-- Task Status Summary -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-750 rounded-lg">
        <div class="text-center">
          <div class="text-lg font-bold text-green-400">{stats.completed}</div>
          <div class="text-xs text-gray-400">Completed</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-blue-400">{stats.inProgress}</div>
          <div class="text-xs text-gray-400">In Progress</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-yellow-400">{stats.pending}</div>
          <div class="text-xs text-gray-400">Pending</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-red-400">{stats.blocked}</div>
          <div class="text-xs text-gray-400">Blocked</div>
        </div>
      </div>

      <!-- Tasks Grid -->
      {#if tasks.length === 0}
        <div class="text-center py-8">
          <p class="text-gray-400">No tasks in this phase match the current filters.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each tasks as task}
            <TaskCard {task} onClick={handleTaskClick} />
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .bg-gray-750 {
    background-color: rgb(55, 65, 81);
  }
</style>
