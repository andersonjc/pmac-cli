<script lang="ts">
  export let error: string;
  export let context: string | undefined = undefined;
  export let warnings: string[] = [];
  export let showDetails: boolean = false;
  export let onRetry: (() => void) | undefined = undefined;
  export let onUseSample: (() => void) | undefined = undefined;

  // Parse error message to extract different types of errors
  $: errorType = getErrorType(error);
  $: errorIcon = getErrorIcon(errorType);
  $: errorColor = getErrorColor(errorType);
  $: suggestions = getSuggestions(errorType, context);

  function getErrorType(errorMsg: string): string {
    if (errorMsg.includes('YAML')) return 'yaml';
    if (errorMsg.includes('Schema') || errorMsg.includes('validation')) return 'validation';
    if (errorMsg.includes('Network') || errorMsg.includes('fetch')) return 'network';
    if (errorMsg.includes('File') || errorMsg.includes('not found')) return 'file';
    return 'general';
  }

  function getErrorIcon(type: string): string {
    switch (type) {
      case 'yaml': return '📝';
      case 'validation': return '🔍';
      case 'network': return '🌐';
      case 'file': return '📁';
      default: return '⚠️';
    }
  }

  function getErrorColor(type: string): string {
    switch (type) {
      case 'yaml': return 'border-yellow-500/20 bg-yellow-600/10';
      case 'validation': return 'border-blue-500/20 bg-blue-600/10';
      case 'network': return 'border-purple-500/20 bg-purple-600/10';
      case 'file': return 'border-orange-500/20 bg-orange-600/10';
      default: return 'border-red-500/20 bg-red-600/10';
    }
  }

  function getSuggestions(type: string, _ctx: string | undefined): string[] {
    const suggestions = [];
    
    if (type === 'yaml') {
      suggestions.push('Check your YAML indentation (use spaces, not tabs)');
      suggestions.push('Ensure all strings with special characters are quoted');
      suggestions.push('Verify that colons are followed by a space');
    } else if (type === 'validation') {
      suggestions.push('Check that all required fields are present');
      suggestions.push('Verify your task IDs are unique');
      suggestions.push('Ensure task dependencies reference existing tasks');
    } else if (type === 'network') {
      suggestions.push('Check your internet connection');
      suggestions.push('Verify the backlog file path is correct');
      suggestions.push('Try refreshing the page');
    } else if (type === 'file') {
      suggestions.push('Check that the backlog file exists');
      suggestions.push('Verify file permissions');
      suggestions.push('Ensure the file path is correct');
    }

    return suggestions;
  }

  function toggleDetails() {
    showDetails = !showDetails;
  }
</script>

<div class="bg-gray-800 border {errorColor} p-6 rounded-lg mb-6">
  <!-- Error Header -->
  <div class="flex items-start gap-4">
    <div class="text-2xl flex-shrink-0 mt-1">
      {errorIcon}
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-semibold text-red-400">
          {errorType === 'yaml' ? 'YAML Parsing Error' : 
           errorType === 'validation' ? 'Validation Error' :
           errorType === 'network' ? 'Network Error' :
           errorType === 'file' ? 'File Error' : 'Error Loading Backlog'}
        </h2>
        
        {#if context}
          <span class="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
            {context}
          </span>
        {/if}
      </div>
      
      <!-- Error Message -->
      <div class="text-red-300 mb-4 leading-relaxed">
        {#if error.includes('\n')}
          <pre class="whitespace-pre-wrap font-mono text-sm bg-gray-900 p-3 rounded border-l-4 border-red-500">{error}</pre>
        {:else}
          <p>{error}</p>
        {/if}
      </div>
      
      <!-- Suggestions -->
      {#if suggestions.length > 0}
        <div class="mb-4">
          <h3 class="text-sm font-semibold text-gray-300 mb-2">💡 Suggestions:</h3>
          <ul class="text-sm text-gray-400 space-y-1">
            {#each suggestions as suggestion}
              <li class="flex items-start gap-2">
                <span class="text-gray-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      
      <!-- Warnings -->
      {#if warnings && warnings.length > 0}
        <div class="mb-4">
          <button 
            class="flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
            on:click={toggleDetails}
          >
            <span>⚠️</span>
            <span>{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</span>
            <svg class="w-4 h-4 transition-transform {showDetails ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {#if showDetails}
            <ul class="mt-2 text-sm text-yellow-300 space-y-1 ml-6">
              {#each warnings as warning}
                <li class="flex items-start gap-2">
                  <span class="text-yellow-500 mt-1">•</span>
                  <span>{warning}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
      
      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        {#if onRetry}
          <button
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            on:click={onRetry}
          >
            🔄 Retry
          </button>
        {/if}
        
        {#if onUseSample}
          <button
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
            on:click={onUseSample}
          >
            📋 Use Sample Data
          </button>
        {/if}
        
        <button
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md text-sm font-medium transition-colors"
          on:click={toggleDetails}
        >
          {showDetails ? '👁️ Hide Details' : '🔍 Show Details'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom scrollbar for pre element */
  pre {
    scrollbar-width: thin;
    scrollbar-color: rgb(75 85 99) rgb(17 24 39);
  }
  
  pre::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  pre::-webkit-scrollbar-track {
    background: rgb(17 24 39);
  }
  
  pre::-webkit-scrollbar-thumb {
    background: rgb(75 85 99);
    border-radius: 4px;
  }
  
  pre::-webkit-scrollbar-thumb:hover {
    background: rgb(107 114 128);
  }
</style>