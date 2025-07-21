<script lang="ts">
  // Filter Panel Component
  import { onMount } from 'svelte';
  import type { TaskStatus, TaskPriority } from '../lib/types';
  import {
    filterState,
    filterOptions,
    clearFilters,
    setStatusFilter,
    setPriorityFilter,
    setPhaseFilter,
    setSearchFilter,
  } from '../lib/stores';

  // URL state management
  function updateURLFromFilters() {
    const params = new URLSearchParams();
    
    if ($filterState.search) params.set('search', $filterState.search);
    if ($filterState.status) params.set('status', $filterState.status);
    if ($filterState.priority) params.set('priority', $filterState.priority);
    if ($filterState.phase) params.set('phase', $filterState.phase);
    
    const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
  }

  function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    filterState.update(state => ({
      ...state,
      search: params.get('search') || '',
      status: params.get('status') as any || null,
      priority: params.get('priority') as any || null,
      phase: params.get('phase') || null,
    }));
  }

  // Reactive URL updates
  $: $filterState && updateURLFromFilters();

  onMount(() => {
    loadFiltersFromURL();
  });

  // Enhanced clear filters
  function handleClearFilters() {
    clearFilters();
    // Update URL after clearing
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Check if any filters are active
  $: hasActiveFilters = !!(
    $filterState.search || 
    $filterState.status || 
    $filterState.priority || 
    $filterState.phase
  );

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement;
    setSearchFilter(target?.value || '');
  }

  function handleStatusChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    setStatusFilter(target?.value as TaskStatus || null);
  }

  function handlePriorityChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    setPriorityFilter(target?.value as TaskPriority || null);
  }

  function handlePhaseChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    setPhaseFilter(target?.value || null);
  }
</script>

<div class="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-gray-100">Filter Tasks</h2>
    {#if hasActiveFilters}
      <span class="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded border border-blue-500/30">
        Filters Active
      </span>
    {/if}
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 min-w-0">
    <!-- Search -->
    <div>
      <label for="search-input" class="block text-sm font-medium text-gray-300 mb-2"> 
        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search 
      </label>
      <input
        id="search-input"
        type="text"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        placeholder="Search tasks..."
        bind:value={$filterState.search}
        on:input={handleSearchInput}
      />
    </div>

    <!-- Status Filter -->
    <div>
      <label for="status-select" class="block text-sm font-medium text-gray-300 mb-2"> Status </label>
      <select
        id="status-select"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        bind:value={$filterState.status}
        on:change={handleStatusChange}
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
      <label for="priority-select" class="block text-sm font-medium text-gray-300 mb-2"> Priority </label>
      <select
        id="priority-select"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        bind:value={$filterState.priority}
        on:change={handlePriorityChange}
      >
        <option value="">All Priorities</option>
        {#each $filterOptions.priorities as priority}
          <option value={priority} class="capitalize">{priority}</option>
        {/each}
      </select>
    </div>

    <!-- Phase Filter -->
    <div>
      <label for="phase-select" class="block text-sm font-medium text-gray-300 mb-2"> Phase </label>
      <select
        id="phase-select"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        bind:value={$filterState.phase}
        on:change={handlePhaseChange}
      >
        <option value="">All Phases</option>
        {#each $filterOptions.phases as phase}
          <option value={phase}>{$filterOptions.phaseLabels[phase] || phase}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="flex justify-end pt-4 border-t border-gray-700">
    <button 
      class="px-4 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 hover:text-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      class:bg-gray-600={hasActiveFilters}
      class:text-gray-100={hasActiveFilters}
      on:click={handleClearFilters}
      disabled={!hasActiveFilters}
    > 
      Clear Filters 
    </button>
  </div>
</div>

<style>
  select {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 40px;
  }
</style>
