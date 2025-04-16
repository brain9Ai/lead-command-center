/**
 * Configuration service for the application
 */

// Default configuration
const defaultConfig = {
  n8n: {
    baseUrl: process.env.REACT_APP_N8N_BASE_URL || 'http://localhost:5678',
    webhookPath: process.env.REACT_APP_N8N_WEBHOOK_PATH || '/webhook',
    apiTimeout: 30000,
  },
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || '/api',
    timeout: 15000,
  },
  features: {
    pollInterval: 5000, // How often to poll for workflow status updates (ms)
    maxPollAttempts: 60, // Maximum number of polling attempts for workflow status
  }
};

// Type for the configuration
export type AppConfig = typeof defaultConfig;

// Storage key for config
const CONFIG_STORAGE_KEY = 'lead_command_center_config';

// Get config from localStorage or use default
const loadConfigFromStorage = (): AppConfig => {
  try {
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (storedConfig) {
      // Merge stored config with default config to ensure all properties exist
      return {
        ...defaultConfig,
        ...JSON.parse(storedConfig)
      };
    }
  } catch (error) {
    console.error('Failed to load config from storage:', error);
  }
  
  return defaultConfig;
};

// Save config to localStorage
const saveConfigToStorage = (config: AppConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config to storage:', error);
  }
};

// Initialize config in storage if not already there
const initializeConfig = (): AppConfig => {
  const existingConfig = loadConfigFromStorage();
  
  // Save to storage if we're using the default config
  if (existingConfig === defaultConfig) {
    saveConfigToStorage(defaultConfig);
  }
  
  return existingConfig;
};

// Configuration service
export const configService = {
  // Get the full config
  getConfig(): AppConfig {
    return loadConfigFromStorage();
  },
  
  // Get a specific config value by path (e.g., 'n8n.baseUrl')
  getValue(path: string): any {
    const config = loadConfigFromStorage();
    const parts = path.split('.');
    
    return parts.reduce((obj, part) => {
      return obj && obj[part] !== undefined ? obj[part] : undefined;
    }, config as any);
  },
  
  // Update the config
  updateConfig(updates: Partial<AppConfig>): AppConfig {
    const config = loadConfigFromStorage();
    const updatedConfig = {
      ...config,
      ...updates
    };
    
    saveConfigToStorage(updatedConfig);
    return updatedConfig;
  },
  
  // Reset config to defaults
  resetConfig(): AppConfig {
    saveConfigToStorage(defaultConfig);
    return defaultConfig;
  },
  
  // Initialize config (call this when app starts)
  initialize(): AppConfig {
    return initializeConfig();
  }
};

// Initialize on import
configService.initialize(); 