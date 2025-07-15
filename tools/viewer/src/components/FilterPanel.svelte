<script lang="ts">
  // Filter Panel Component
  import {
    filterState,
    filterOptions,
    clearFilters,
    setStatusFilter,
    setPriorityFilter,
    setPhaseFilter,
    setSearchFilter,
    toggleCompletedTasks,
  } from '../lib/stores';
</script>

<div class="card p-6 mb-6">
  <h2 class="text-lg font-semibold mb-4 text-pmac-text-primary">Filter Tasks</h2>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
    <!-- Search -->
    <div>
      <label class="block text-sm font-medium text-pmac-text-secondary mb-1"> Search </label>
      <input
        type="text"
        class="input w-full"
        placeholder="Search tasks..."
        bind:value={$filterState.search}
        on:input={e => setSearchFilter(e.target?.value || '')}
      />
    </div>

    <!-- Status Filter -->
    <div>
      <label class="block text-sm font-medium text-pmac-text-secondary mb-1"> Status </label>
      <select
        class="input w-full"
        bind:value={$filterState.status}
        on:change={e => setStatusFilter(e.target?.value || null)}
      >
        <option value="">All Statuses</option>
        {#each $filterOptions.statuses as status}
          <option value={status}>
            {status === 'in_progress'
              ? 'In Progress'
              : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </option>
        {/each}
      </select>
    </div>

    <!-- Priority Filter -->
    <div>
      <label class="block text-sm font-medium text-pmac-text-secondary mb-1"> Priority </label>
      <select
        class="input w-full"
        bind:value={$filterState.priority}
        on:change={e => setPriorityFilter(e.target?.value || null)}
      >
        <option value="">All Priorities</option>
        {#each $filterOptions.priorities as priority}
          <option value={priority}>{priority}</option>
        {/each}
      </select>
    </div>

    <!-- Phase Filter -->
    <div>
      <label class="block text-sm font-medium text-pmac-text-secondary mb-1"> Phase </label>
      <select
        class="input w-full"
        bind:value={$filterState.phase}
        on:change={e => setPhaseFilter(e.target?.value || null)}
      >
        <option value="">All Phases</option>
        {#each $filterOptions.phases as phase}
          <option value={phase}>{$filterOptions.phaseLabels[phase] || phase}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="flex items-center justify-between">
    <label class="flex items-center">
      <input
        type="checkbox"
        class="mr-2"
        bind:checked={$filterState.showCompleted}
        on:change={toggleCompletedTasks}
      />
      <span class="text-sm text-pmac-text-secondary">Show completed tasks</span>
    </label>

    <button class="btn-secondary text-sm" on:click={clearFilters}> Clear Filters </button>
  </div>
</div>

<style>
  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 40px;
  }
</style>
