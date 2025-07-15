/**
 * Configuration for PMaC Backlog Viewer
 * Manages paths and settings for data loading
 */

export interface ViewerConfig {
  backlogPath: string;
  refreshInterval: number;
  enableAutoRefresh: boolean;
  fallbackToSample: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: ViewerConfig = {
  backlogPath: './project-backlog.yml',
  refreshInterval: 5000, // 5 seconds
  enableAutoRefresh: true,
  fallbackToSample: true
};

/**
 * Get configuration from URL parameters or environment
 */
export function getConfig(): ViewerConfig {
  const config = { ...DEFAULT_CONFIG };
  
  // Check URL parameters
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Override backlog path from URL parameter
    const backlogParam = urlParams.get('backlog');
    if (backlogParam) {
      config.backlogPath = backlogParam;
    }
    
    // Override refresh interval
    const refreshParam = urlParams.get('refresh');
    if (refreshParam) {
      const interval = parseInt(refreshParam, 10);
      if (!isNaN(interval) && interval > 0) {
        config.refreshInterval = interval * 1000; // Convert to milliseconds
      }
    }
    
    // Override auto-refresh setting
    const autoRefreshParam = urlParams.get('autoRefresh');
    if (autoRefreshParam) {
      config.enableAutoRefresh = autoRefreshParam === 'true';
    }
    
    // Override fallback setting
    const fallbackParam = urlParams.get('fallback');
    if (fallbackParam) {
      config.fallbackToSample = fallbackParam === 'true';
    }
  }
  
  return config;
}

/**
 * Available backlog paths for different environments
 */
export const BACKLOG_PATHS = {
  // Local development - actual working file
  LOCAL: './project-backlog.yml',
  
  // Parent directory (for integrated development)
  PARENT: '../project-backlog.yml',
  
  // Viewer directory (current implementation)
  VIEWER: './tools/viewer/project-backlog.yml'
};

/**
 * Try multiple paths to find the correct backlog file
 */
export async function findBacklogFile(primaryPath?: string): Promise<string> {
  const pathsToTry = [
    primaryPath || DEFAULT_CONFIG.backlogPath,
    BACKLOG_PATHS.LOCAL,
    BACKLOG_PATHS.PARENT,
    BACKLOG_PATHS.VIEWER
  ].filter(Boolean);
  
  for (const path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return path;
      }
    } catch (error) {
      // Continue trying other paths
      continue;
    }
  }
  
  // If no file found, return the primary path for error handling
  return primaryPath || DEFAULT_CONFIG.backlogPath;
}

/**
 * Development server configuration
 */
export const DEV_CONFIG = {
  // For development, try the actual working file first
  backlogPath: './project-backlog.yml',
  
  // Enable live reloading in development
  enableAutoRefresh: true,
  refreshInterval: 2000, // 2 seconds for development
  
  // Always fallback to sample data in development
  fallbackToSample: true
};

/**
 * Production configuration
 */
export const PROD_CONFIG = {
  // For production, look for backlog in current directory
  backlogPath: './project-backlog.yml',
  
  // Disable auto-refresh in production
  enableAutoRefresh: false,
  refreshInterval: 0,
  
  // No fallback in production
  fallbackToSample: false
};

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(): ViewerConfig {
  const isProduction = import.meta.env.PROD;
  const baseConfig = isProduction ? PROD_CONFIG : DEV_CONFIG;
  
  // Merge with URL parameters
  const urlConfig = getConfig();
  
  return {
    ...baseConfig,
    ...urlConfig
  };
}