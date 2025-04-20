import { useState, useEffect } from 'react';
import axios from 'axios';
import { Workflow, WorkflowCategory } from '../types/workflows';
import { 
  N8N_BASE_URL, 
  WEBHOOK_PATHS, 
  DEFAULT_PARAMETERS, 
  API_TIMEOUT,
  getWebhookUrl
} from '../config';

// Define actual workflows based on directory structure
const realWorkflows: Workflow[] = [
  // Lead Generation workflows
  {
    id: 'linkedin-job-scraper',
    name: 'LinkedIn Job Scraper',
    description: 'Scrapes job posts from LinkedIn to identify companies actively hiring for target roles',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: getWebhookUrl('linkedin-job-scraper'),
    parameters: [
      {
        name: 'searchQuery',
        type: 'string',
        label: 'Job Title or Keyword',
        required: true,
        description: 'Job title or keyword to search for'
      },
      {
        name: 'maxResults',
        type: 'number',
        label: 'Maximum Results',
        required: false,
        default: 50,
        description: 'Maximum number of results to return'
      }
    ]
  },
  {
    id: 'apollo-lead-scrape',
    name: 'Apollo Lead Scraper',
    description: 'Extracts contact information using Apollo.io data source',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: getWebhookUrl('apollo-lead-scrape'),
    parameters: [
      {
        name: 'domains',
        type: 'string',
        label: 'Company Domains',
        required: true,
        description: 'Comma-separated list of company domains'
      },
      {
        name: 'jobTitles',
        type: 'string',
        label: 'Job Titles',
        required: false,
        default: 'CEO, CTO, Founder, Director',
        description: 'Comma-separated list of job titles to target'
      }
    ]
  },
  {
    id: 'sales-navigator-lead-scraper',
    name: 'Sales Navigator Lead Scraper',
    description: 'Extracts leads from LinkedIn Sales Navigator using advanced filters',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: getWebhookUrl('sales-navigator-lead-scraper'),
    parameters: [
      {
        name: 'filterCriteria',
        type: 'string',
        label: 'Filter Criteria',
        required: true,
        description: 'Criteria to use for filtering leads (JSON)'
      }
    ]
  },
  {
    id: 'decision-makers-scraper',
    name: 'Decision Makers Scraper',
    description: 'Extracts leadership and decision-maker titles from company profiles',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: getWebhookUrl('decision-makers-scraper'),
    parameters: [
      {
        name: 'companyNames',
        type: 'string',
        label: 'Company Names',
        required: true,
        description: 'Comma-separated list of company names'
      }
    ]
  },
  {
    id: 'name-only-lead-generator',
    name: 'Name Only Lead Generator',
    description: 'Finds leads when only partial name or domain is available',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: getWebhookUrl('name-only-lead-generator'),
    parameters: [
      {
        name: 'partialInfo',
        type: 'string',
        label: 'Partial Information',
        required: true,
        description: 'Partial name, email, or domain information'
      }
    ]
  },
  {
    id: 'keywords-based-decision-makers',
    name: 'Keywords-Based Decision Makers',
    description: 'Identifies leads based on custom keywords in job titles or descriptions',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: getWebhookUrl('keywords-based-decision-makers'),
    parameters: [
      {
        name: 'keywords',
        type: 'string',
        label: 'Keywords',
        required: true,
        description: 'Comma-separated list of keywords'
      }
    ]
  },

  // Lead Qualification workflows
  {
    id: 'lead-qualification-yt',
    name: '3-Step Lead Qualification',
    description: 'Filters leads using job title, seniority, and signal-based logic',
    category: WorkflowCategory.LeadQualification,
    webhookUrl: getWebhookUrl('lead-qualification-yt'),
    parameters: [
      {
        name: 'inputSource',
        type: 'string',
        label: 'Input Source',
        required: true,
        description: 'Source of leads to qualify (e.g., Airtable table name)'
      }
    ]
  },
  {
    id: 'personalization-trigger',
    name: 'Personalization Trigger Logic',
    description: 'Flags qualified leads for enrichment and email generation workflows',
    category: WorkflowCategory.LeadQualification,
    webhookUrl: getWebhookUrl('personalization-trigger'),
    parameters: [
      {
        name: 'qualificationThreshold',
        type: 'number',
        label: 'Qualification Threshold',
        required: false,
        default: 70,
        description: 'Minimum score to qualify a lead (0-100)'
      }
    ]
  },

  // Lead Enrichment workflows
  {
    id: 'scrape-and-enrich',
    name: 'Scrape & Enrich',
    description: 'Triggers multi-source data enrichment from LinkedIn, Apollo, and websites',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: getWebhookUrl('scrape-and-enrich'),
    parameters: [
      {
        name: 'leadIds',
        type: 'string',
        label: 'Lead IDs',
        required: true,
        description: 'Comma-separated list of lead IDs to enrich'
      }
    ]
  },
  {
    id: 'linkedin-profile-scraper',
    name: 'LinkedIn Profile Scraper',
    description: 'Fetches job history, summary, and personal insights from LinkedIn profiles',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: getWebhookUrl('linkedin-profile-scraper'),
    parameters: [
      {
        name: 'profileUrls',
        type: 'string',
        label: 'Profile URLs',
        required: true,
        description: 'Comma-separated list of LinkedIn profile URLs'
      }
    ]
  },
  {
    id: 'enrich-company-website',
    name: 'Company Website Enrichment',
    description: 'Scrapes company homepage, service pages, about us section',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: getWebhookUrl('enrich-company-website'),
    parameters: [
      {
        name: 'websiteUrls',
        type: 'string',
        label: 'Website URLs',
        required: true,
        description: 'Comma-separated list of company website URLs'
      }
    ]
  },
  {
    id: 'website-sections-analyzer',
    name: 'Website Sections Analyzer',
    description: 'Breaks content into summaries: vision, mission, testimonials, case studies',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: getWebhookUrl('website-sections-analyzer'),
    parameters: [
      {
        name: 'websiteUrls',
        type: 'string',
        label: 'Website URLs',
        required: true,
        description: 'Comma-separated list of company website URLs'
      }
    ]
  },
  {
    id: 'department-completeness-check',
    name: 'Department Completeness Check',
    description: 'Ensures company has multiple relevant departments (e.g., sales, growth)',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: getWebhookUrl('department-completeness-check'),
    parameters: [
      {
        name: 'companyIds',
        type: 'string',
        label: 'Company IDs',
        required: true,
        description: 'Comma-separated list of company IDs'
      }
    ]
  },

  // AI Personalization workflows
  {
    id: 'ai-personalization-yt',
    name: 'AI Personalization Generator',
    description: 'Generates email content using structured GPT-4 prompts',
    category: WorkflowCategory.AIPersonalization,
    webhookUrl: getWebhookUrl('ai-personalization-yt'),
    parameters: [
      {
        name: 'leadIds',
        type: 'string',
        label: 'Lead IDs',
        required: true,
        description: 'Comma-separated list of lead IDs'
      }
    ]
  },
  {
    id: 'linkedin-post-enricher',
    name: 'LinkedIn Post Enricher',
    description: 'Pulls recent posts from leads for topical email references',
    category: WorkflowCategory.AIPersonalization,
    webhookUrl: getWebhookUrl('linkedin-post-enricher'),
    parameters: [
      {
        name: 'profileUrls',
        type: 'string',
        label: 'Profile URLs',
        required: true,
        description: 'Comma-separated list of LinkedIn profile URLs'
      }
    ]
  },
  {
    id: 'personal-company-deep-insight',
    name: 'Personal & Company Deep Insight',
    description: 'Extracts and formats insights for GPT-based personalization',
    category: WorkflowCategory.AIPersonalization,
    webhookUrl: getWebhookUrl('personal-company-deep-insight'),
    parameters: [
      {
        name: 'leadIds',
        type: 'string',
        label: 'Lead IDs',
        required: true,
        description: 'Comma-separated list of lead IDs'
      }
    ]
  },

  // Replies & Follow-ups workflows
  {
    id: 'inbox-management',
    name: 'Inbox Management',
    description: 'Monitors replies via API, classifies responses, and triggers follow-ups',
    category: WorkflowCategory.RepliesAndFollowups,
    webhookUrl: getWebhookUrl('inbox-management'),
    parameters: [
      {
        name: 'monitoringPeriod',
        type: 'number',
        label: 'Monitoring Period (hours)',
        required: false,
        default: 24,
        description: 'Period to monitor replies in hours'
      }
    ]
  }
];

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(realWorkflows);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, we would fetch workflows from the server
  useEffect(() => {
    // This would be an API call in a real implementation
    setWorkflows(realWorkflows);
  }, []);

  /**
   * Execute a workflow via webhook
   * @param workflowId The ID of the workflow to execute
   * @param parameters Parameters to pass to the workflow
   * @returns Object with success status and data from the Respond to Webhook node
   */
  const executeWorkflow = async (workflowId: string, parameters: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      try {
        // Make the actual API call to n8n webhook
        const response = await axios.post(workflow.webhookUrl, parameters, {
          timeout: API_TIMEOUT
        });
        
        console.log(`Workflow ${workflowId} executed with response:`, response.data);
        
        return { 
          success: true, 
          message: response.data?.message || 'Workflow started successfully',
          data: response.data 
        };
      } catch (apiError: any) {
        console.error(`API error for workflow ${workflowId}:`, apiError);
        throw new Error(`API error: ${apiError.message}`);
      }
    } catch (err: any) {
      setError(err.message);
      return { 
        success: false, 
        message: err.message,
        error: err.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowsByCategory = (category: WorkflowCategory | 'all') => {
    if (category === 'all') {
      return workflows;
    }
    return workflows.filter(w => w.category === category);
  };

  return {
    workflows,
    loading,
    error,
    executeWorkflow,
    getWorkflowsByCategory
  };
}; 