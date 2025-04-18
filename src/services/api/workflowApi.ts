import { v4 as uuidv4 } from 'uuid';
import { 
  WorkflowStatus,
  WorkflowExecutionStatus as WorkflowExecutionStatusType,
  WorkflowCategory
} from '../../features/workflows/types';
import { apiConfig, getCorsProxyUrl, workflowWebhookMap } from '../../config/apiConfig';

// Define local execution status type to match the enum in types.ts
type WorkflowExecutionStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'unknown';

// Map to convert n8n status values to our application statuses
const ExecutionStatusMap: Record<string, WorkflowExecutionStatus> = {
  'new': 'pending',
  'waiting': 'pending',
  'running': 'running',
  'success': 'completed',
  'completed': 'completed',
  'error': 'failed',
  'failed': 'failed',
  'cancelled': 'cancelled',
  'timeout': 'failed'
};

interface WorkflowExecutionResult {
  executionId: string;
  status: WorkflowExecutionStatus;
  data?: any;
}

/**
 * API service for workflow-related operations
 */
export const workflowApi = {
  /**
   * Trigger a workflow execution via webhook
   * @param workflowId - The ID of the workflow to trigger
   * @param payload - Optional payload data to send with the request
   * @returns Promise containing the execution ID and initial status
   */
  triggerWorkflow: async (workflowId: string, payload?: any): Promise<{ 
    executionId: string; 
    status: WorkflowExecutionStatus;
    success: boolean;
    message?: string;
  }> => {
    try {
      // Generate a unique execution ID for tracking
      const executionId = uuidv4();
      
      // Prepare the payload with the execution ID included
      const requestPayload = {
        executionId,
        ...payload,
      };
      
      // Construct the webhook URL
      let baseWebhookUrl;
      
      // Check if workflowId already has the full path structure
      if (workflowId.includes('/') || workflowId.includes('-')) {
        // It's an ID like 'e697d609-eca3-4822-8037-65a4eac1704f'
        baseWebhookUrl = `${apiConfig.n8nBaseUrl}/webhook/${workflowId}`;
      } else {
        // It's a relative path
        baseWebhookUrl = `${apiConfig.n8nBaseUrl}${apiConfig.webhooks.triggerWebhook}/${workflowId}`;
      }
      
      // For n8n webhooks, we need to add the API key as a query parameter
      if (apiConfig.apiKey) {
        const hasQueryParams = baseWebhookUrl.includes('?');
        baseWebhookUrl += hasQueryParams ? `&apiKey=${apiConfig.apiKey}` : `?apiKey=${apiConfig.apiKey}`;
      }
      
      console.log('Using webhook URL:', baseWebhookUrl);
      
      // We're no longer using the CORS proxy
      const webhookUrl = baseWebhookUrl;
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      // Add API key as header too (some n8n instances accept this)
      if (apiConfig.apiKey) {
        headers['X-N8N-API-KEY'] = apiConfig.apiKey;
      }
      
      // Make the API call to trigger the workflow
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      
      if (!response.ok) {
        console.error('Error response details:', {
          status: response.status,
          statusText: response.statusText,
          url: webhookUrl,
        });
        throw new Error(`Failed to trigger workflow: ${response.statusText}`);
      }
      
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response from webhook:', responseData);
      } catch (e) {
        // If response is not JSON, just continue
        console.log('Response not in JSON format', e);
      }
      
      // Return the execution ID and initial status
      return {
        executionId,
        status: 'pending',
        success: true,
        message: 'Workflow triggered successfully'
      };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return {
        executionId: '',
        status: 'failed',
        success: false,
        message: error instanceof Error ? error.message : 'Failed to trigger workflow'
      };
    }
  },
  
  /**
   * Check the status of a workflow execution
   * @param executionId - The unique ID of the execution to check
   * @returns Promise containing the current execution status
   */
  checkExecutionStatus: async (executionId: string): Promise<WorkflowExecutionResult> => {
    try {
      // Construct the status check URL
      const baseStatusUrl = `${apiConfig.n8nBaseUrl}/api/v1/executions/${executionId}`;
      
      // Always add API key as a query parameter for consistency
      let statusUrl = baseStatusUrl;
      if (apiConfig.apiKey) {
        // Add API key as query parameter for consistent authentication
        const hasQueryParams = baseStatusUrl.includes('?');
        statusUrl += hasQueryParams ? `&apiKey=${apiConfig.apiKey}` : `?apiKey=${apiConfig.apiKey}`;
      }
      
      console.log('Checking execution status with URL:', statusUrl);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      // Also add API key as header for maximum compatibility
      if (apiConfig.apiKey) {
        headers['X-N8N-API-KEY'] = apiConfig.apiKey;
      }
      
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check execution status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Map the n8n status to our application status model
      const status = ExecutionStatusMap[data.status] || 'unknown';
      
      return {
        executionId,
        status,
        data: data.data,
      };
    } catch (error) {
      console.error('Error checking execution status:', error);
      return {
        executionId,
        status: 'unknown'
      };
    }
  },
  
  /**
   * Set up a server-sent events (SSE) connection to listen for status updates
   * @param executionId - The unique ID of the execution to monitor
   * @param onStatusUpdate - Callback function to handle status updates
   * @returns Cleanup function to close the connection
   */
  setupStatusListener: (executionId: string, onStatusUpdate: (status: WorkflowExecutionResult) => void): () => void => {
    try {
      // Create a new EventSource connection to the status updates endpoint
      const baseEventsUrl = `${apiConfig.n8nBaseUrl}/api/events/workflow/${executionId}`;
      
      // For EventSource, we'll use polling instead of the CORS proxy since 
      // EventSource doesn't work well with most CORS proxies
      let eventSource: EventSource | null = null;
      
      // For localhost, we'll use polling instead of EventSource
      const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
      
      if (isLocal) {
        // Set up polling as a fallback
        const intervalId = setInterval(async () => {
          try {
            const status = await workflowApi.checkExecutionStatus(executionId);
            onStatusUpdate(status);
            
            // If we've reached a terminal state, stop polling
            if (
              status.status === 'completed' ||
              status.status === 'failed' ||
              status.status === 'cancelled'
            ) {
              clearInterval(intervalId);
            }
          } catch (error) {
            console.error('Error polling for status update:', error);
          }
        }, 2000); // Poll every 2 seconds
        
        // Return a cleanup function
        return () => {
          clearInterval(intervalId);
        };
      } else {
        // For non-localhost, use EventSource
        eventSource = new EventSource(baseEventsUrl);
        
        // Handle incoming events
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Map the status and call the update function
            const status = ExecutionStatusMap[data.status] || 'unknown';
            onStatusUpdate({
              executionId,
              status,
              data: data.data,
            });
            
            // If we've reached a terminal state, close the connection
            if (
              status === 'completed' ||
              status === 'failed' ||
              status === 'cancelled'
            ) {
              eventSource?.close();
            }
          } catch (error) {
            console.error('Error processing status update:', error);
          }
        };
        
        // Handle connection errors
        eventSource.onerror = (error) => {
          console.error('Status listener connection error:', error);
          eventSource?.close();
        };
        
        // Return a cleanup function
        return () => {
          eventSource?.close();
        };
      }
    } catch (error) {
      console.error('Error setting up status listener:', error);
      return () => {}; // Return empty cleanup function
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

  // LEAD GENERATION WORKFLOWS
  
  /**
   * Trigger the Sales Navigator Lead Scraper workflow
   * @param filterCriteria - JSON criteria for filtering leads
   * @returns Promise with the execution result
   */
  triggerSalesNavigatorScraper: async (filterCriteria: string): Promise<{ 
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('sales-navigator-lead-scraper', { filterCriteria });
  },
  
  /**
   * Trigger the LinkedIn Job Scraper workflow
   * @param searchQuery - Job title or keyword to search for
   * @param maxResults - Maximum number of results to return
   * @returns Promise with the execution result
   */
  triggerLinkedInJobScraper: async (searchQuery: string, maxResults = 50): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('linkedin-job-scraper', { searchQuery, maxResults });
  },
  
  /**
   * Trigger the Apollo Lead Scraper workflow
   * @param domains - Comma-separated list of company domains
   * @param jobTitles - Optional comma-separated list of job titles
   * @returns Promise with the execution result
   */
  triggerApolloLeadScraper: async (domains: string, jobTitles?: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('apollo-lead-scraper', { domains, jobTitles });
  },
  
  /**
   * Trigger the Decision Makers workflow
   * @param companyDomains - Comma-separated list of company domains
   * @param jobTitles - Optional comma-separated list of job titles
   * @returns Promise with the execution result
   */
  triggerDecisionMakers: async (companyDomains: string, jobTitles?: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('decision-makers', { companyDomains, jobTitles });
  },
  
  // LEAD QUALIFICATION WORKFLOWS
  
  /**
   * Trigger the 3-Step Lead Qualification workflow
   * @param inputSource - Source of leads to qualify
   * @returns Promise with the execution result
   */
  trigger3StepQualification: async (inputSource: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('3-step-qualification', { inputSource });
  },
  
  /**
   * Trigger the Personalization workflow
   * @param minScore - Minimum qualification score
   * @returns Promise with the execution result
   */
  triggerPersonalization: async (minScore = 70): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('personalization', { minScore });
  },
  
  // LEAD ENRICHMENT WORKFLOWS
  
  /**
   * Trigger the LinkedIn Personalization workflow
   * @param profileUrls - Comma-separated list of LinkedIn profile URLs
   * @returns Promise with the execution result
   */
  triggerLinkedInPersonalization: async (profileUrls: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('linkedin-personalization', { profileUrls });
  },
  
  /**
   * Trigger the Scrape + Enrich workflow
   * @param leadIds - Comma-separated list of lead IDs to enrich
   * @returns Promise with the execution result
   */
  triggerScrapeEnrich: async (leadIds: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('scrape-enrich', { leadIds });
  },
  
  /**
   * Trigger the Website Sections workflow
   * @param domainName - Company domain name to analyze
   * @param sections - Optional comma-separated list of sections to extract
   * @returns Promise with the execution result
   */
  triggerWebsiteSections: async (domainName: string, sections?: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('website-sections', { domainName, sections });
  },
  
  // AI PERSONALIZATION WORKFLOWS
  
  /**
   * Trigger the Deep Insights - About Page workflow
   * @param companyUrl - URL of the company's about page
   * @returns Promise with the execution result
   */
  triggerDeepInsights: async (companyUrl: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('deep-insights-about-page', { companyUrl });
  },
  
  /**
   * Trigger the LinkedIn Post Personal + Company workflow
   * @param profileUrl - LinkedIn profile URL
   * @param companyUrl - LinkedIn company URL
   * @returns Promise with the execution result
   */
  triggerLinkedInPostAnalysis: async (profileUrl: string, companyUrl: string): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('linkedin-post-analysis', { profileUrl, companyUrl });
  },
  
  /**
   * Trigger the AI Personalization | 3 Snippets workflow
   * @param profileData - Profile data to personalize
   * @returns Promise with the execution result
   */
  trigger3Snippets: async (profileData: any): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('ai-personalization-3-snippets', { profileData });
  },
  
  // REPLIES & FOLLOW-UPS WORKFLOWS
  
  /**
   * Trigger the Department-specific follow-up workflow
   * @param department - Department to personalize for
   * @param profileData - Profile data for personalization
   * @returns Promise with the execution result
   */
  triggerDepartmentFollowup: async (department: string, profileData: any): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    return workflowApi.triggerWorkflow('department-followup', { department, profileData });
  },
  
  /**
   * Batch execute multiple workflows in sequence
   * @param workflows - Array of workflow IDs and their parameters
   * @returns Promise with the execution results
   */
  batchExecuteWorkflows: async (workflows: Array<{ id: string; params: any }>): Promise<{
    success: boolean;
    results: Array<{ id: string; executionId: string; success: boolean; }>
  }> => {
    const results = [];
    let overallSuccess = true;
    
    for (const workflow of workflows) {
      try {
        const result = await workflowApi.triggerWorkflow(workflow.id, workflow.params);
        results.push({
          id: workflow.id,
          executionId: result.executionId,
          success: result.success
        });
        
        if (!result.success) {
          overallSuccess = false;
        }
      } catch (error) {
        console.error(`Error executing workflow ${workflow.id}:`, error);
        results.push({
          id: workflow.id,
          executionId: '',
          success: false
        });
        overallSuccess = false;
      }
    }
    
    return {
      success: overallSuccess,
      results
    };
  }
}; 