/**
 * Global configuration for the Lead Command Center application
 */

// Base URL for n8n webhooks
export const N8N_BASE_URL = process.env.REACT_APP_N8N_BASE_URL || 'http://localhost:5678';

// Category to folder mapping (for organization on disk)
export const CATEGORY_FOLDER_MAP = {
  'Lead Generation': '1-Lead Generation',
  'Lead Qualification': '2-Lead Qualification',
  'Lead Enrichment': '3-Lead Enrichment',
  'AI Personalization': '4-AI Personalization',
  'Replies & Follow-ups': '5-Replies & Follow-ups'
};

// Webhook paths for different workflow categories
export const WEBHOOK_PATHS: Record<string, string> = {
  // Lead Generation workflows
  'linkedin-job-scraper': '/webhook/lead-generation/linkedin-job',
  'apollo-lead-scrape': '/webhook/lead-generation/apollo',
  'sales-navigator-lead-scraper': '/webhook/lead-generation/sales-navigator',
  'decision-makers-scraper': '/webhook/lead-generation/decision-makers',
  'name-only-lead-generator': '/webhook/lead-generation/name-only',
  'keywords-based-decision-makers': '/webhook/lead-generation/keywords',
  
  // Lead Qualification workflows
  'lead-qualification-yt': '/webhook/qualification/yt-qualification',
  'personalization-trigger': '/webhook/qualification/personalization-trigger',
  
  // Lead Enrichment workflows
  'scrape-and-enrich': '/webhook/enrichment/scrape-enrich',
  'linkedin-profile-scraper': '/webhook/enrichment/linkedin-profile',
  'enrich-company-website': '/webhook/enrichment/company-website',
  'website-sections-analyzer': '/webhook/enrichment/website-sections',
  'department-completeness-check': '/webhook/enrichment/department-check',
  
  // AI Personalization workflows
  'ai-personalization-yt': '/webhook/personalization/yt-personalization',
  'linkedin-post-enricher': '/webhook/personalization/linkedin-post',
  'personal-company-deep-insight': '/webhook/personalization/deep-insight',
  
  // Replies & Follow-ups workflows
  'inbox-management': '/webhook/replies/inbox-management'
};

// Function to get the full webhook URL for a workflow
export const getWebhookUrl = (workflowId: string): string => {
  const path = WEBHOOK_PATHS[workflowId] || '/webhook/unknown';
  return `${N8N_BASE_URL}${path}`;
};

// Default parameters for workflows
export const DEFAULT_PARAMETERS: Record<string, Record<string, any>> = {
  'linkedin-job-scraper': {
    searchQuery: '',
    maxResults: 50
  },
  'apollo-lead-scrape': {
    domains: '',
    jobTitles: 'CEO, CTO, Founder, Director'
  }
  // Add more default parameters as needed
};

// API timeout in milliseconds
export const API_TIMEOUT = 30000; 