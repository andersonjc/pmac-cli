<script lang="ts">
  // Stats Panel Component
  import { projectStats, filteredTasks } from '../lib/stores';
</script>

<div class="card p-6 mb-6">
  <h2 class="text-lg font-semibold mb-4 text-pmac-text-primary">
    Project Statistics
  </h2>
  
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <!-- Total Tasks -->
    <div class="text-center">
      <div class="text-2xl font-bold text-pmac-text-primary">
        {$projectStats.totalTasks}
      </div>
      <div class="text-sm text-pmac-text-secondary">Total Tasks</div>
    </div>
    
    <!-- Completed Tasks -->
    <div class="text-center">
      <div class="text-2xl font-bold text-green-400">
        {$projectStats.completedTasks}
      </div>
      <div class="text-sm text-pmac-text-secondary">Completed</div>
    </div>
    
    <!-- Total Hours -->
    <div class="text-center">
      <div class="text-2xl font-bold text-pmac-text-primary">
        {$projectStats.totalHours}h
      </div>
      <div class="text-sm text-pmac-text-secondary">Total Hours</div>
    </div>
    
    <!-- Completion Percentage -->
    <div class="text-center">
      <div class="text-2xl font-bold text-blue-400">
        {Math.round($projectStats.completionPercentage)}%
      </div>
      <div class="text-sm text-pmac-text-secondary">Complete</div>
    </div>
  </div>
  
  <!-- Progress Bar -->
  <div class="mb-4">
    <div class="flex justify-between text-sm text-pmac-text-secondary mb-1">
      <span>Progress</span>
      <span>{$projectStats.completedTasks} of {$projectStats.totalTasks} tasks</span>
    </div>
    <div class="w-full bg-gray-700 rounded-full h-2">
      <div 
        class="bg-blue-500 h-2 rounded-full transition-all duration-300"
        style="width: {$projectStats.completionPercentage}%"
      ></div>
    </div>
  </div>
  
  <!-- Phase Statistics -->
  <div class="space-y-2">
    <h3 class="text-sm font-medium text-pmac-text-secondary">Phase Progress</h3>
    {#each Object.entries($projectStats.phaseStats) as [phaseName, stats]}
      <div class="flex items-center justify-between text-sm">
        <span class="text-pmac-text-primary capitalize">{phaseName}</span>
        <div class="flex items-center space-x-2">
          <span class="text-pmac-text-secondary">
            {stats.completed}/{stats.total}
          </span>
          <div class="w-16 bg-gray-700 rounded-full h-1">
            <div 
              class="bg-green-500 h-1 rounded-full"
              style="width: {stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%"
            ></div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- Filtered Results -->
  {#if $filteredTasks.length !== $projectStats.totalTasks}
    <div class="mt-4 pt-4 border-t border-gray-600">
      <div class="text-sm text-pmac-text-secondary">
        Showing {$filteredTasks.length} of {$projectStats.totalTasks} tasks
      </div>
    </div>
  {/if}
</div>