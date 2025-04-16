/**
 * Configuration for API connections and webhook settings
 */

export interface ApiConfig {
  n8nBaseUrl: string;
  webhooks: {
    triggerWebhook: string;
    callbackEndpoint: string;
    statusUpdatePath: string;
  };
  polling: {
    enabled: boolean;
    interval: number; // in milliseconds
  };
}

export const apiConfig: ApiConfig = {
  // Base URL for the n8n API
  n8nBaseUrl: 'https://brain9.app.n8n.cloud',
  
  // Webhook configuration
  webhooks: {
    // Path to trigger workflows via webhook
    triggerWebhook: '/webhook/trigger',
    
    // Endpoint where n8n can send callbacks
    callbackEndpoint: 'https://your-app.example.com/api/webhook-callback',
    
    // Path to handle status updates from n8n
    statusUpdatePath: '/api/workflow-status-update',
  },
  
  // Polling configuration for workflow status
  polling: {
    enabled: true,
    interval: 30000, // 30 seconds
  },
};

// Helper functions for API operations

/**
 * Get the complete URL for a specific n8n API endpoint
 */
export const getN8nApiUrl = (endpoint: string): string => {
  const baseUrl = apiConfig.n8nBaseUrl;
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${formattedEndpoint}`;
};

/**
 * Get the complete webhook URL for a specific workflow
 */
export const getWebhookUrl = (workflowId: string): string => {
  return `${apiConfig.n8nBaseUrl}/webhook/${workflowId}`;
};

/**
 * Get the status update webhook URL
 */
export const getStatusUpdateUrl = (): string => {
  return `${window.location.origin}${apiConfig.webhooks.statusUpdatePath}`;
};

/**
 * Check if the API configuration is valid
 */
export const isApiConfigValid = (): boolean => {
  return (
    !!apiConfig.n8nBaseUrl &&
    apiConfig.n8nBaseUrl.startsWith('http')
  );
}; 