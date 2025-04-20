import { v4 as uuidv4 } from 'uuid';
import { 
  WorkflowCategory 
} from '../../features/workflows/types';
import { apiConfig, workflowWebhookMap } from '../../config/apiConfig';
import axios from 'axios';

/**
 * API service for workflow-related operations
 * Simplified to only handle direct workflow triggering with immediate response from Respond to Webhook node
 */
export const workflowApi = {
  /**
   * Test connectivity to the n8n server
   * @returns Promise with connection status
   */
  testConnectivity: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.get(`${apiConfig.n8nBaseUrl}/health`, {
        headers: apiConfig.apiKey ? {
          'X-N8N-API-KEY': apiConfig.apiKey
        } : undefined,
        timeout: 10000 // 10 second timeout
      });
      
      return {
        success: response.status === 200,
        message: response.status === 200 
          ? 'Connected successfully to n8n server'
          : `Connection error: Status ${response.status}`
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error 
          ? `Connection failed: ${error.message}`
          : 'Connection failed with unknown error'
      };
    }
  },
  
  /**
   * Generic method to trigger a workflow via webhook
   * @param webhookId The webhook ID to trigger
   * @param parameters The parameters to send with the webhook
   * @returns Promise with the result
   */
  triggerWorkflow: async (
    webhookId: string,
    parameters: Record<string, any> = {}
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    console.log(`Triggering webhook ${webhookId} with parameters:`, parameters);
    
    try {
      // Ensure parameters are properly formatted for JSON transmission
      const formattedParams = Object.entries(parameters).reduce((acc, [key, value]) => {
        // Handle different types correctly
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          // Arrays and objects can be passed directly
          acc[key] = value;
        } else if (value !== undefined && value !== null) {
          // Primitive types (string, number, boolean)
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const webhookUrl = `${apiConfig.n8nBaseUrl}${webhookId}`;
      console.log(`Sending request to: ${webhookUrl}`);
      
      const response = await axios.post(webhookUrl, formattedParams, {
        headers: {
          'Content-Type': 'application/json',
          ...(apiConfig.apiKey ? {'X-N8N-API-KEY': apiConfig.apiKey} : {})
        }
      });
      
      console.log('Webhook response:', response.data);
      
      return {
        success: true,
        message: 'Workflow triggered successfully',
        data: response.data
      };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      
      // Create a meaningful error message
      let errorMessage = 'Unknown error occurred';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.message}`;
        } else if (error.request) {
          errorMessage = `No response received: ${error.message}`;
        } else {
          errorMessage = `Request error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  
  /**
   * Get the appropriate webhook URL for a workflow based on its category and name
   * @param category - The workflow category
   * @param workflowName - The workflow name
   * @returns The appropriate webhook URL
   */
  getWebhookUrlForWorkflow: (category: WorkflowCategory, workflowName: string): string => {
    // First check if we have a specific mapping for this workflow name
    const specificWebhookId = workflowWebhookMap[workflowName]; 
    if (specificWebhookId) {
      return `${apiConfig.webhooks.triggerWebhook}/${specificWebhookId}`;
    }
    
    // Fall back to the category/name pattern
    const categoryPath = category.toLowerCase().replace(/\s+/g, '-');
    const workflowPath = workflowName.toLowerCase().replace(/\s+\|\s+/g, '-').replace(/\s+/g, '-');
    
    return `${apiConfig.webhooks.triggerWebhook}/${categoryPath}/${workflowPath}`;
  },
  
  // Specialized trigger methods for convenience
  // These all call triggerWorkflow internally with the right parameters
  
  // Lead Generation methods
  triggerSalesNavigatorScraper: async (
    filterCriteria: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    // Map to the generic triggerWorkflow with the appropriate parameters
    return workflowApi.triggerWorkflow('sales-navigator-scraper', {
      filterCriteria
    });
  },
  
  triggerLinkedInJobScraper: async (
    searchQuery: string,
    maxResults: number = 10,
    location?: string
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    // Map to the generic triggerWorkflow with the appropriate parameters
    const params: Record<string, any> = {
      searchQuery,
      maxResults: Number(maxResults)
    };
    
    // Only add location if it's defined
    if (location) {
      params.location = location;
    }
    
    return workflowApi.triggerWorkflow('linkedin-job-scraper', params);
  },
  
  triggerApolloLeadScraper: async (domains: string[], jobTitles: string[]) => {
    return workflowApi.triggerWorkflow('apollo-lead-scraper', { domains, jobTitles });
  },
  
  triggerDecisionMakers: async (companyDomains: string[], jobTitles: string[]) => {
    return workflowApi.triggerWorkflow('decision-makers', { companyDomains, jobTitles });
  },
  
  // Lead Qualification methods
  trigger3StepQualification: async (inputSource: string) => {
    return workflowApi.triggerWorkflow('3-step-qualification', { inputSource });
  },
  
  triggerPersonalization: async (minScore: number) => {
    return workflowApi.triggerWorkflow('personalization', { minScore });
  },
  
  // Lead Enrichment methods
  triggerLinkedInPersonalization: async (profileUrls: string[]) => {
    return workflowApi.triggerWorkflow('linkedin-personalization', { profileUrls });
  },
  
  triggerScrapeEnrich: async (leadIds: string[]) => {
    return workflowApi.triggerWorkflow('scrape-enrich', { leadIds });
  },
  
  triggerWebsiteSections: async (domainName: string, sections: string[]) => {
    return workflowApi.triggerWorkflow('website-sections', { domainName, sections });
  },
  
  // AI Personalization methods
  triggerDeepInsights: async (companyUrl: string) => {
    return workflowApi.triggerWorkflow('deep-insights-about-page', { companyUrl });
  },
  
  triggerLinkedInPostAnalysis: async (profileUrl: string, companyUrl: string) => {
    return workflowApi.triggerWorkflow('linkedin-post-personal-company', { profileUrl, companyUrl });
  },
  
  trigger3Snippets: async (profileData: string) => {
    return workflowApi.triggerWorkflow('ai-personalization-3-snippets', { profileData });
  },
  
  // Replies & Follow-ups methods
  triggerDepartmentFollowup: async (department: string, profileData: string) => {
    return workflowApi.triggerWorkflow('ai-personalization-departments', { department, profileData });
  }
}; 