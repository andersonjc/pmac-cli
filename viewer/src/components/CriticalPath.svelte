<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { TaskWithPhase, DependencyNode, DependencyEdge } from '../lib/types';
  
  /* eslint-disable no-undef */

  export let tasks: TaskWithPhase[] = [];
  export let width = 800;
  export let height = 600;
  
  // Responsive sizing
  let containerElement: HTMLDivElement | undefined;
  let responsiveWidth = width;
  let responsiveHeight = height;
  
  function updateDimensions() {
    if (containerElement) {
      const containerWidth = containerElement.offsetWidth;
      responsiveWidth = Math.max(containerWidth - 40, 320); // Min width 320px with 40px padding
      responsiveHeight = Math.max(Math.min(responsiveWidth * 0.6, 600), 300); // Aspect ratio 5:3, max 600px, min 300px
    }
  }
  
  onMount(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
  });
  
  onDestroy(() => {
    window.removeEventListener('resize', updateDimensions);
  });

  const dispatch = createEventDispatcher<{
    taskSelect: { task: TaskWithPhase };
  }>();

  // Graph state
  let svgElement: SVGSVGElement;
  let nodes: DependencyNode[] = [];
  let edges: DependencyEdge[] = [];
  let criticalPath: string[] = [];
  let hoveredNode: string | null = null;
  let selectedNode: string | null = null;

  // Zoom and pan state
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Layout constants
  const NODE_RADIUS = 25;
  
  // Responsive spacing values
  $: NODE_SPACING_X = Math.max(responsiveWidth / 6, 120); // Adaptive based on width
  $: NODE_SPACING_Y = Math.max(responsiveHeight / 8, 80); // Adaptive based on height
  $: LEVELS_PADDING = Math.max(responsiveWidth / 20, 40); // Adaptive padding

  // Calculate critical path using topological sort and longest path
  function calculateCriticalPath(taskList: TaskWithPhase[]): {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
    criticalPath: string[];
  } {
    const taskMap = new Map<string, TaskWithPhase>();
    const nodeMap = new Map<string, DependencyNode>();
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const distances = new Map<string, number>();

    // Build task map and initialize structures
    for (const task of taskList) {
      taskMap.set(task.id, task);
      adjacencyList.set(task.id, []);
      inDegree.set(task.id, 0);
      distances.set(task.id, 0);
      
      nodeMap.set(task.id, {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        phase: task.phase,
        dependencies: task.dependencies || [],
        blocks: task.blocks || [],
        x: 0,
        y: 0,
        estimated_hours: task.estimated_hours,
        isCritical: false,
      });
    }

    // Build dependency graph and calculate in-degrees
    for (const task of taskList) {
      for (const depId of task.dependencies || []) {
        if (taskMap.has(depId)) {
          adjacencyList.get(depId)?.push(task.id);
          inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
        }
      }
    }

    // Topological sort with critical path calculation
    const queue: string[] = [];
    const levels = new Map<string, number>();

    // Start with tasks that have no dependencies
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(taskId);
        levels.set(taskId, 0);
      }
    }

    let maxLevel = 0;
    const processedOrder: string[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      processedOrder.push(currentId);
      const currentTask = taskMap.get(currentId)!;
      const currentLevel = levels.get(currentId) || 0;
      const currentDistance = distances.get(currentId) || 0;

      // Process dependents
      for (const dependentId of adjacencyList.get(currentId) || []) {
        const newDistance = currentDistance + currentTask.estimated_hours;
        if (newDistance > (distances.get(dependentId) || 0)) {
          distances.set(dependentId, newDistance);
        }

        const newLevel = currentLevel + 1;
        if (newLevel > (levels.get(dependentId) || 0)) {
          levels.set(dependentId, newLevel);
          maxLevel = Math.max(maxLevel, newLevel);
        }

        const newInDegree = (inDegree.get(dependentId) || 0) - 1;
        inDegree.set(dependentId, newInDegree);

        if (newInDegree === 0) {
          queue.push(dependentId);
        }
      }
    }

    // Find critical path (longest path in terms of hours)
    const maxDistance = Math.max(...Array.from(distances.values()));
    const criticalTasks: string[] = [];

    // Trace back from tasks with maximum distance
    for (const [taskId, distance] of distances) {
      if (distance === maxDistance) {
        criticalTasks.push(taskId);
        break; // Take the first one for simplicity
      }
    }

    // Trace back the full critical path
    const path: string[] = [];
    if (criticalTasks.length > 0) {
      let current = criticalTasks[0];
      path.push(current);

      while (current) {
        const currentTask = taskMap.get(current);
        let predecessor: string | null = null;
        let maxPredDistance = -1;

        // Find the predecessor with the highest distance
        for (const depId of currentTask?.dependencies || []) {
          const depDistance = distances.get(depId) || 0;
          if (depDistance > maxPredDistance) {
            maxPredDistance = depDistance;
            predecessor = depId;
          }
        }

        if (predecessor) {
          path.unshift(predecessor);
          current = predecessor;
        } else {
          break;
        }
      }
    }

    // Mark critical path nodes
    for (const taskId of path) {
      const node = nodeMap.get(taskId);
      if (node) {
        node.isCritical = true;
      }
    }

    // Calculate positions using hierarchical layout
    const levelNodes = new Map<number, string[]>();
    for (const [taskId, level] of levels) {
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)!.push(taskId);
    }

    // Position nodes (left to right layout)
    let currentX = LEVELS_PADDING;
    for (let level = 0; level <= maxLevel; level++) {
      const levelTaskIds = levelNodes.get(level) || [];
      const levelHeight = levelTaskIds.length * NODE_SPACING_Y;
      const startY = (responsiveHeight - levelHeight) / 2;

      levelTaskIds.forEach((taskId, index) => {
        const node = nodeMap.get(taskId);
        if (node) {
          node.x = currentX;
          node.y = startY + (index * NODE_SPACING_Y) + NODE_SPACING_Y / 2;
        }
      });

      currentX += NODE_SPACING_X;
    }

    // Create edges
    const edgeList: DependencyEdge[] = [];
    for (const [taskId, task] of taskMap) {
      const fromNode = nodeMap.get(taskId);
      if (!fromNode) continue;

      for (const depId of task.dependencies || []) {
        const toNode = nodeMap.get(depId);
        if (toNode) {
          edgeList.push({
            from: depId,
            to: taskId,
            type: 'dependency',
            fromX: toNode.x || 0,
            fromY: toNode.y || 0,
            toX: fromNode.x || 0,
            toY: fromNode.y || 0,
            isCritical: path.includes(depId) && path.includes(taskId),
          });
        }
      }
    }

    return {
      nodes: Array.from(nodeMap.values()),
      edges: edgeList,
      criticalPath: path,
    };
  }

  // Handle mouse events for zoom and pan
  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    event.preventDefault();
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    translateX += deltaX;
    translateY += deltaY;

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  // Removed unused handleWheel function - using handleWheelSimple instead
  
  // Touch event handlers for mobile support
  let touchStartDistance = 0;
  let touchStartScale = 1;
  
  function handleTouchStart(event: TouchEvent) {
    event.preventDefault();
    
    if (event.touches.length === 1) {
      // Single touch - start panning
      isDragging = true;
      lastMouseX = event.touches[0].clientX;
      lastMouseY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // Two touches - start zooming
      isDragging = false;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      touchStartDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      touchStartScale = scale;
    }
  }
  
  function handleTouchMove(event: TouchEvent) {
    event.preventDefault();
    
    if (event.touches.length === 1 && isDragging) {
      // Single touch - panning
      const touch = event.touches[0];
      const deltaX = touch.clientX - lastMouseX;
      const deltaY = touch.clientY - lastMouseY;
      
      translateX += deltaX;
      translateY += deltaY;
      
      lastMouseX = touch.clientX;
      lastMouseY = touch.clientY;
    } else if (event.touches.length === 2) {
      // Two touches - zooming
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scaleRatio = currentDistance / touchStartDistance;
      scale = Math.max(0.1, Math.min(touchStartScale * scaleRatio, 3));
    }
  }
  
  function handleTouchEnd(event: TouchEvent) {
    event.preventDefault();
    
    if (event.touches.length === 0) {
      isDragging = false;
    }
  }
  
  // Simplified wheel handler
  function handleWheelSimple(event: WheelEvent) {
    event.preventDefault();
    
    const rect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(3, scale * scaleFactor));
    
    // Zoom towards mouse position
    const scaleChange = newScale / scale;
    translateX = mouseX - (mouseX - translateX) * scaleChange;
    translateY = mouseY - (mouseY - translateY) * scaleChange;
    
    scale = newScale;
  }

  // Handle node interactions
  function handleNodeClick(node: DependencyNode) {
    selectedNode = node.id;
    const task = tasks.find(t => t.id === node.id);
    if (task) {
      dispatch('taskSelect', { task });
    }
  }

  function handleNodeHover(nodeId: string | null) {
    hoveredNode = nodeId;
  }

  // Get node color based on status and critical path
  function getNodeColor(node: DependencyNode): string {
    if (node.isCritical) {
      return node.id === selectedNode ? '#ef4444' : '#f59e0b';
    }
    
    switch (node.status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'testing': return '#8b5cf6';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  }

  // Get edge color
  function getEdgeColor(edge: DependencyEdge): string {
    return edge.isCritical ? '#f59e0b' : '#4b5563';
  }

  // Reactive updates
  $: if (tasks && tasks.length > 0) {
    const result = calculateCriticalPath(tasks);
    nodes = result.nodes;
    edges = result.edges;
    criticalPath = result.criticalPath;
  }

  // Reset view
  function resetView() {
    scale = 1;
    translateX = 0;
    translateY = 0;
  }

  onMount(() => {
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });
</script>

<div class="critical-path-container">
  <!-- Controls -->
  <div class="controls mb-4 flex items-center gap-4">
    <button 
      class="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
      on:click={resetView}
    >
      Reset View
    </button>
    
    <div class="text-sm text-gray-400">
      Critical Path: {criticalPath.length} tasks, 
      {nodes.filter(n => n.isCritical).reduce((sum, n) => sum + n.estimated_hours, 0)} hours
    </div>
    
    <div class="text-xs text-gray-500">
      Use mouse wheel to zoom, drag to pan
    </div>
  </div>

  <!-- SVG Visualization -->
  <div class="graph-container border border-gray-700 rounded-lg overflow-hidden bg-gray-800 min-w-0 max-w-full" bind:this={containerElement}>
    <svg
      bind:this={svgElement}
      width={responsiveWidth}
      height={responsiveHeight}
      viewBox="0 0 {responsiveWidth} {responsiveHeight}"
      class="cursor-grab active:cursor-grabbing w-full h-auto"
      on:mousedown={handleMouseDown}
      on:wheel={handleWheelSimple}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <defs>
        <!-- Arrowhead marker -->
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#4b5563"
          />
        </marker>
        
        <!-- Critical path arrowhead -->
        <marker
          id="arrowhead-critical"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#f59e0b"
          />
        </marker>
        
        <!-- Glow filter for critical path -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Transform group for zoom and pan -->
      <g transform="translate({translateX}, {translateY}) scale({scale})">
        <!-- Edges -->
        {#each edges as edge}
          {#if edge.fromX !== undefined && edge.fromY !== undefined && edge.toX !== undefined && edge.toY !== undefined}
          <line
            x1={edge.fromX + NODE_RADIUS}
            y1={edge.fromY}
            x2={edge.toX - NODE_RADIUS}
            y2={edge.toY}
            stroke={getEdgeColor(edge)}
            stroke-width={edge.isCritical ? 3 : 2}
            marker-end={edge.isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
            filter={edge.isCritical ? "url(#glow)" : "none"}
            opacity={edge.isCritical ? 1 : 0.7}
          />
          {/if}
        {/each}

        <!-- Nodes -->
        {#each nodes as node}
          <g 
            class="node cursor-pointer"
            transform="translate({node.x}, {node.y})"
            on:click={() => handleNodeClick(node)}
            on:mouseenter={() => handleNodeHover(node.id)}
            on:mouseleave={() => handleNodeHover(null)}
            role="button"
            tabindex="0"
          >
            <!-- Node circle -->
            <circle
              r={NODE_RADIUS}
              fill={getNodeColor(node)}
              stroke={node.id === selectedNode ? '#ffffff' : '#374151'}
              stroke-width={node.id === selectedNode ? 3 : 2}
              filter={node.isCritical ? "url(#glow)" : "none"}
              opacity={node.id === hoveredNode ? 0.8 : 1}
            />
            
            <!-- Node label -->
            <text
              text-anchor="middle"
              dominant-baseline="middle"
              fill="white"
              font-size="10"
              font-weight="bold"
              pointer-events="none"
            >
              {node.id.split('-')[1] || node.id}
            </text>
            
            <!-- Hover tooltip -->
            {#if hoveredNode === node.id}
              <g class="tooltip" transform="translate(30, -10)">
                <rect
                  x="0"
                  y="0"
                  width="200"
                  height="80"
                  fill="#1f2937"
                  stroke="#4b5563"
                  stroke-width="1"
                  rx="4"
                />
                <text x="8" y="16" fill="#f3f4f6" font-size="12" font-weight="bold">
                  {node.title.substring(0, 25)}{node.title.length > 25 ? '...' : ''}
                </text>
                <text x="8" y="32" fill="#9ca3af" font-size="10">
                  Status: {node.status.replace('_', ' ')}
                </text>
                <text x="8" y="46" fill="#9ca3af" font-size="10">
                  Priority: {node.priority}
                </text>
                <text x="8" y="60" fill="#9ca3af" font-size="10">
                  Hours: {node.estimated_hours}
                </text>
                {#if node.isCritical}
                  <text x="8" y="74" fill="#f59e0b" font-size="10" font-weight="bold">
                    ⚡ Critical Path
                  </text>
                {/if}
              </g>
            {/if}
          </g>
        {/each}
      </g>
    </svg>
  </div>

  <!-- Legend -->
  <div class="legend mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-green-500"></div>
      <span class="text-gray-300">Completed</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-blue-500"></div>
      <span class="text-gray-300">In Progress</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-purple-500"></div>
      <span class="text-gray-300">Testing</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-gray-500"></div>
      <span class="text-gray-300">Ready</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-red-500"></div>
      <span class="text-gray-300">Blocked</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-4 h-4 rounded-full bg-yellow-500" style="filter: drop-shadow(0 0 6px #f59e0b);"></div>
      <span class="text-gray-300">Critical Path</span>
    </div>
  </div>
</div>

<style>
  .critical-path-container {
    @apply w-full;
  }
  
  .graph-container {
    @apply relative;
    min-height: 400px;
  }
  
  .node {
    transition: opacity 0.2s ease;
  }
  
  .node:hover circle {
    filter: brightness(1.2);
  }
  
  .tooltip {
    pointer-events: none;
  }
</style>