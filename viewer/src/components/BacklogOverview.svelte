<script lang="ts">
  import { appState, projectStats } from '../lib/stores';

  // Reactive data from stores
  $: backlog = $appState.backlog;
  $: stats = $projectStats;

  // Calculate completion percentage
  $: completionPercentage = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;


  // Format date for display
  function formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  // Format duration for display
  function formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 8); // Assuming 8-hour work days
    return `${days}d`;
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-full">
  <!-- Project Summary Card -->
  <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 min-w-0 max-w-full">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-100">Project Summary</h3>
        <p class="text-sm text-gray-400">Overall progress and statistics</p>
      </div>
    </div>

    <!-- Overall Progress -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-300">Overall Progress</span>
        <span class="text-sm text-gray-400">{Math.round(completionPercentage)}%</span>
      </div>
      <div class="w-full bg-gray-700 rounded-full h-3">
        <div 
          class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
          style="width: {completionPercentage}%"
        ></div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-2 gap-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-400">{stats.completedTasks}</div>
        <div class="text-xs text-gray-400">of {stats.totalTasks} tasks</div>
        <div class="text-xs text-gray-500 mt-1">Completed</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-400">{stats.completedHours}</div>
        <div class="text-xs text-gray-400">of {stats.totalHours} hours</div>
        <div class="text-xs text-gray-500 mt-1">Hours Done</div>
      </div>
    </div>
  </div>

  <!-- Project Metadata Card -->
  {#if backlog}
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 min-w-0 max-w-full">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-100">Project Info</h3>
          <p class="text-sm text-gray-400">Metadata and timeline</p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex justify-between items-start">
          <span class="text-sm text-gray-400 flex-shrink-0">Version:</span>
          <span class="text-sm text-gray-100 font-mono break-all text-right">{backlog.metadata.version}</span>
        </div>
        <div class="flex justify-between items-start">
          <span class="text-sm text-gray-400 flex-shrink-0">Last Updated:</span>
          <span class="text-sm text-gray-100 break-all text-right">{formatDate(backlog.metadata.last_updated)}</span>
        </div>
        <div class="flex justify-between items-start">
          <span class="text-sm text-gray-400 flex-shrink-0">Current Sprint:</span>
          <span class="text-sm text-gray-100 capitalize break-all text-right">{backlog.metadata.current_sprint}</span>
        </div>
        {#if backlog.epic_summary}
          <div class="flex justify-between items-start">
            <span class="text-sm text-gray-400 flex-shrink-0">Duration:</span>
            <span class="text-sm text-gray-100 break-all text-right">{backlog.epic_summary.estimated_duration}</span>
          </div>
        {/if}
        <div class="flex justify-between items-start">
          <span class="text-sm text-gray-400 flex-shrink-0">Phases:</span>
          <span class="text-sm text-gray-100 break-all text-right">{Object.keys(backlog.phases).length}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Timeline Card -->
  {#if backlog?.epic_summary}
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-6 min-w-0 max-w-full">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-100">Timeline</h3>
          <p class="text-sm text-gray-400">Estimated completion</p>
        </div>
      </div>

      <div class="space-y-3">
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-400">{backlog.epic_summary.total_estimated_hours}</div>
          <div class="text-xs text-gray-400">Total Hours</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-100">{backlog.epic_summary.estimated_duration}</div>
          <div class="text-xs text-gray-400">Estimated Duration</div>
        </div>
        <div class="text-center">
          <div class="text-sm text-gray-300">{formatDuration(stats.totalHours - stats.completedHours)}</div>
          <div class="text-xs text-gray-400">Remaining Work</div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .bg-gray-750 {
    background-color: rgb(55, 65, 81);
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>