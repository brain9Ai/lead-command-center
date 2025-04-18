/**
 * Configuration for API connections and webhook settings
 */

import { WorkflowCategory } from '../types/workflows';

export interface ApiConfig {
  n8nBaseUrl: string;
  corsProxy: string;
  apiKey: string;
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
  
  // CORS proxy URL - prepend this to n8n requests to bypass CORS
  corsProxy: 'https://cors.sh/',
  
  // n8n API key for authentication (get this from your n8n settings)
  apiKey: '', // This will be set from localStorage by the settings component
  
  // Webhook configuration
  webhooks: {
    // Path to trigger workflows via webhook
    triggerWebhook: '/webhook',
    
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

// Helper function to get URL with CORS proxy if needed
export const getCorsProxyUrl = (url: string): string => {
  // Disable CORS proxy completely and always return the original URL
  return url;
};

// Mapping of workflow categories to their n8n webhook paths
export const categoryPathMap: Record<string, string> = {
  "Lead Generation": 'lead-generation',
  "Lead Qualification": 'lead-qualification',
  "Lead Enrichment": 'lead-enrichment',
  "AI Personalization": 'ai-personalization',
  "Replies & Follow-ups": 'replies-followups',
  "Campaign Management": 'campaign-management',
  "Data Integration": 'data-integration',
  "Analytics & Reporting": 'analytics-reporting',
};

// Mapping of workflow names to their n8n webhook IDs
export const workflowWebhookMap: Record<string, string> = {
  // Lead Generation
  'Sales Navigator Lead Scraper': 'sales-navigator-lead-scraper',
  'Lead Generation | Name Only': 'lead-generation-name-only',
  'Lead Generation | Keywords - Email': 'lead-generation-keywords-email',
  'Lead Generation | Decision Makers': 'lead-generation-decision-makers',
  'Automated LinkedIn Job Scraper': 'linkedin-job-scraper',
  'Apollo Lead Scrape': 'apollo-lead-scrape',
  'Sales|LG| Keywords - Email': 'e697d609-eca3-4822-8037-65a4eac1704f',
  
  // Lead Qualification
  '3-Step Lead Qualification': '3-step-lead-qualification',
  'Personalization': 'personalization-trigger',
  
  // Lead Enrichment
  'LinkedIn Personalization': 'linkedin-personalization',
  'Scrape + Enrich': 'scrape-enrich',
  'Linkedin': 'linkedin-profile',
  'Enrichment | Website Sections': 'website-sections',
  'Company Website | Smart Crawler': 'company-website-crawler',
  
  // AI Personalization
  'Deep Insights - About Page': 'deep-insights-about-page',
  'LinkedIn Post | Personal + Company': 'linkedin-post-analysis',
  'AI Personalization | 3 Snippets': 'ai-personalization-3-snippets',
  'AI Personalization | Departments': 'ai-personalization-departments',
  
  // Replies & Follow-ups
  'Replies | AI Personalization | Departments': 'ai-personalization-departments-followup',
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
  return `${apiConfig.n8nBaseUrl}${apiConfig.webhooks.triggerWebhook}/${workflowId}`;
};

/**
 * Get the webhookId for a workflow based on its name and category
 * @param workflowName - The name of the workflow
 * @param category - The category of the workflow as a string
 * @returns The webhook ID to use for this workflow
 */
export const getWebhookId = (workflowName: string, category: string): string => {
  // Try to get the specific mapping for this workflow name
  const specificWebhookId = workflowWebhookMap[workflowName];
  if (specificWebhookId) {
    return specificWebhookId;
  }
  
  // Fall back to a generated ID based on the name and category
  const categoryPath = categoryPathMap[category] || category.toLowerCase().replace(/\s+/g, '-');
  const workflowPath = workflowName.toLowerCase()
    .replace(/\s+\|\s+/g, '-')
    .replace(/\s+/g, '-');
    
  return `${categoryPath}/${workflowPath}`;
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