import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, WorkflowExecution, WorkflowStatus } from '../types';
import { WorkflowCategory } from '../../../types/workflows';
import { workflowApi } from '../../../services/api/workflowApi';
import { apiConfig, getWebhookId, getCorsProxyUrl } from '../../../config/apiConfig';

// Store for executions, shared across hook instances
let executionsStore: WorkflowExecution[] = [];
// Define a more flexible type for the event source
let eventSource: EventSource | (() => void) | null = null;

/**
 * Hook for managing workflow executions
 */
export const useWorkflowExecution = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [statusUpdateCount, setStatusUpdateCount] = useState(0);
  
  // Load settings from localStorage if available
  const loadApiSettings = useCallback(() => {
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        
        // Update apiConfig with saved settings
        (apiConfig as any).n8nBaseUrl = parsedSettings.n8nBaseUrl || apiConfig.n8nBaseUrl;
        (apiConfig.webhooks as any).callbackEndpoint = parsedSettings.callbackEndpoint || apiConfig.webhooks.callbackEndpoint;
        (apiConfig.polling as any).enabled = parsedSettings.pollingEnabled !== undefined 
          ? parsedSettings.pollingEnabled 
          : apiConfig.polling.enabled;
        (apiConfig.polling as any).interval = (parsedSettings.pollingInterval || apiConfig.polling.interval / 1000) * 1000;
        
        return parsedSettings;
      } catch (e) {
        console.error('Error parsing saved API settings:', e);
      }
    }
    return null;
  }, []);
  
  // Load executions from localStorage
  const syncWithLocalStorage = useCallback(async () => {
    try {
      // First load the API settings
      loadApiSettings();
      
      // Then load saved executions
      const savedExecutions = localStorage.getItem('workflowExecutions');
      if (savedExecutions) {
        try {
          const parsedExecutions = JSON.parse(savedExecutions);
          executionsStore = parsedExecutions;
          return true;
        } catch (e) {
          console.error('Error parsing saved executions:', e);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error syncing with localStorage:', error);
      return false;
    }
  }, [loadApiSettings]);
  
  // Save executions to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('workflowExecutions', JSON.stringify(executionsStore));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }, []);
  
  // Set up event source for real-time updates
  const setupEventSource = useCallback(() => {
    if (!eventSource) {
      try {
        // Setup listener for all running executions
        const runningExecutions = executionsStore
          .filter(exec => exec.status === 'running')
          .slice(0, 5); // Limit to 5 most recent
        
        if (runningExecutions.length > 0) {
          // Setup individual listeners for each running execution
          runningExecutions.forEach(execution => {
            const listenerCleanup = workflowApi.setupStatusListener(
              execution.id, 
              (statusUpdate) => {
                // Map the status update to our execution format
                const updatedExecution: Partial<WorkflowExecution> = {
                  id: statusUpdate.executionId,
                  status: statusUpdate.status as WorkflowStatus,
                  result: statusUpdate.data
                };
                
                // Update the execution
                updateExecution({
                  ...execution,
                  ...updatedExecution
                });
                
                // Trigger a re-render
                setStatusUpdateCount(prev => prev + 1);
              }
            );
            
            // For simplicity, we're just storing the cleanup for the last one
            // In a real implementation, you'd want to track all of them
            eventSource = listenerCleanup;
          });
        }
      } catch (error) {
        console.error('Error setting up event source:', error);
      }
    }
    
    return () => {
      if (eventSource) {
        if (typeof eventSource === 'function') {
          eventSource();
        } else {
          eventSource.close();
        }
        eventSource = null;
      }
    };
  }, []);
  
  // Set up polling for workflow status updates
  const setupPolling = useCallback(() => {
    // Only set up polling if enabled in settings
    if (!apiConfig.polling.enabled) {
      return () => {}; // No-op cleanup function
    }
    
    // Find running executions that need status updates
    const runningExecutions = executionsStore
      .filter(exec => exec.status === 'running')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10); // Limit to 10 most recent
    
    if (runningExecutions.length === 0) {
      return () => {}; // No-op cleanup function
    }
    
    setIsPolling(true);
    
    // Set up interval to poll for updates
    const intervalId = setInterval(async () => {
      for (const execution of runningExecutions) {
        await checkExecutionStatus(execution.id);
      }
    }, apiConfig.polling.interval);
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, []);
  
  // On initialization, setup event sources if polling is disabled
  useEffect(() => {
    console.log('useWorkflowExecution hook initialized');
    
    // Disable automatic health check
    // testN8nConnectivity();
    
    // If polling is disabled, we need to set up event sources for push notifications
    if (!apiConfig.polling.enabled) {
      setupEventSource();
    }
    
    // Make sure we have a workflow execution store
    syncWithLocalStorage().then(() => {
      // Set up polling for workflow status updates if there are running executions
      const cleanupPolling = setupPolling();
      
      // Return cleanup function
      return () => {
        cleanupPolling();
        // Clean up event sources if they exist
        if (eventSource && typeof eventSource !== 'function') {
          eventSource.close();
        }
      };
    });
  }, [setupEventSource, setupPolling, syncWithLocalStorage]);
  
  // Update an execution in the store
  const updateExecution = useCallback((execution: WorkflowExecution) => {
    const index = executionsStore.findIndex(e => e.id === execution.id);
    
    if (index >= 0) {
      // Update existing execution
      executionsStore[index] = {
        ...executionsStore[index],
        ...execution
      };
    } else {
      // Add new execution
      executionsStore.unshift(execution);
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update the update count to trigger a re-render
    setStatusUpdateCount(prev => prev + 1);
  }, [saveToLocalStorage]);

  // Execute a workflow
  const executeWorkflow = useCallback(async (
    workflow: Workflow,
    parameters: Record<string, any> = {}
  ): Promise<{ success: boolean; executionId: string }> => {
    try {
      // Generate a webhookId for this workflow
      const webhookId = getWebhookId(workflow.name, workflow.category);
      
      // Trigger the workflow via the API
      const result = await workflowApi.triggerWorkflow(webhookId, parameters);
      
      if (result.success && result.executionId) {
        // Create a new execution record
        const newExecution: WorkflowExecution = {
          id: result.executionId,
          workflowId: workflow.id,
          status: result.status as WorkflowStatus,
          startTime: new Date().toISOString(),
          endTime: undefined as unknown as string,
          parameters,
          result: null,
          error: null
        };
        
        // Update the store
        updateExecution(newExecution);
        
        return {
          success: true,
          executionId: result.executionId
        };
      } else {
        // Create a failed execution record
        const newExecution: WorkflowExecution = {
          id: uuidv4(), // Generate a random ID since we didn't get one from the API
          workflowId: workflow.id,
          status: 'failed',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          parameters,
          result: null,
          error: result.message || 'Failed to trigger workflow'
        };
        
        // Update the store
        updateExecution(newExecution);
        
        return {
          success: false,
          executionId: ''
        };
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      return {
        success: false,
        executionId: ''
      };
    }
  }, [updateExecution]);

  // Execute a workflow using the specialized API methods based on the workflow category and name
  const executeSpecializedWorkflow = useCallback(async (
    workflow: Workflow,
    parameters: Record<string, any> = {}
  ): Promise<{ success: boolean; executionId: string }> => {
    try {
      // Use specialized workflow API methods based on category and name
      let result;
      const category = workflow.category;
      const name = workflow.name;
      
      // Check the workflow category and use the appropriate API method
      switch (category) {
        case "Lead Generation":
          if (name === 'Sales Navigator Lead Scraper') {
            result = await workflowApi.triggerSalesNavigatorScraper(parameters.filterCriteria);
          } else if (name === 'Automated LinkedIn Job Scraper') {
            result = await workflowApi.triggerLinkedInJobScraper(parameters.searchQuery, parameters.maxResults);
          } else if (name === 'Apollo Lead Scrape') {
            result = await workflowApi.triggerApolloLeadScraper(parameters.domains, parameters.jobTitles);
          } else if (name === 'Lead Generation | Decision Makers') {
            result = await workflowApi.triggerDecisionMakers(parameters.companyDomains, parameters.jobTitles);
          } else {
            // Fall back to generic execution
            return executeWorkflow(workflow, parameters);
          }
          break;
          
        case "Lead Qualification":
          if (name === '3-Step Lead Qualification') {
            result = await workflowApi.trigger3StepQualification(parameters.inputSource);
          } else if (name === 'Personalization') {
            result = await workflowApi.triggerPersonalization(parameters.minScore);
          } else {
            return executeWorkflow(workflow, parameters);
          }
          break;
          
        case "Lead Enrichment":
          if (name === 'LinkedIn Personalization') {
            result = await workflowApi.triggerLinkedInPersonalization(parameters.profileUrls);
          } else if (name === 'Scrape + Enrich') {
            result = await workflowApi.triggerScrapeEnrich(parameters.leadIds);
          } else if (name === 'Enrichment | Website Sections') {
            result = await workflowApi.triggerWebsiteSections(parameters.domainName, parameters.sections);
          } else {
            return executeWorkflow(workflow, parameters);
          }
          break;
          
        case "AI Personalization":
          if (name === 'Deep Insights - About Page') {
            result = await workflowApi.triggerDeepInsights(parameters.companyUrl);
          } else if (name === 'LinkedIn Post | Personal + Company') {
            result = await workflowApi.triggerLinkedInPostAnalysis(parameters.profileUrl, parameters.companyUrl);
          } else if (name === 'AI Personalization | 3 Snippets') {
            result = await workflowApi.trigger3Snippets(parameters.profileData);
          } else {
            return executeWorkflow(workflow, parameters);
          }
          break;
          
        case "Replies & Follow-ups":
          if (name === 'AI Personalization | Departments') {
            result = await workflowApi.triggerDepartmentFollowup(parameters.department, parameters.profileData);
          } else {
            return executeWorkflow(workflow, parameters);
          }
          break;
          
        default:
          // For other categories, use the generic execution method
          return executeWorkflow(workflow, parameters);
      }
      
      if (result?.success && result?.executionId) {
        // Create a new execution record
        const newExecution: WorkflowExecution = {
          id: result.executionId,
          workflowId: workflow.id,
          status: 'running',
          startTime: new Date().toISOString(),
          endTime: undefined as unknown as string,
          parameters,
          result: null,
          error: null
        };
        
        // Update the store
        updateExecution(newExecution);
        
        return {
          success: true,
          executionId: result.executionId
        };
      } else {
        // Create a failed execution record
        const newExecution: WorkflowExecution = {
          id: uuidv4(),
          workflowId: workflow.id,
          status: 'failed',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          parameters,
          result: null,
          error: result?.message || 'Failed to trigger workflow'
        };
        
        // Update the store
        updateExecution(newExecution);
        
        return {
          success: false,
          executionId: ''
        };
      }
    } catch (error) {
      console.error('Error executing specialized workflow:', error);
      
      // Fall back to the generic execution method
      return executeWorkflow(workflow, parameters);
    }
  }, [executeWorkflow, updateExecution]);
  
  // Check execution status
  const checkExecutionStatus = useCallback(async (executionId: string): Promise<boolean> => {
    try {
      // Find the execution in our store
      const index = executionsStore.findIndex(e => e.id === executionId);
      if (index === -1) {
        console.error(`Execution ${executionId} not found in store`);
        return false;
      }
      
      // Get the current execution
      const execution = executionsStore[index];
      
      // Only check status for running executions
      if (execution.status !== 'running') {
        return true;
      }
      
      // Check status via API
      const result = await workflowApi.checkExecutionStatus(executionId);
      
      // Update the execution with the new status
      updateExecution({
        ...execution,
        status: result.status as WorkflowStatus,
        result: result.data,
        endTime: result.status === 'completed' || result.status === 'failed' 
          ? new Date().toISOString() 
          : undefined as unknown as string
      });
      
      return true;
    } catch (error) {
      console.error('Error checking execution status:', error);
      return false;
    }
  }, [updateExecution]);
  
  // Get executions by workflow ID
  const getExecutionsByWorkflowId = useCallback((workflowId: string): WorkflowExecution[] => {
    return executionsStore
      .filter(e => e.workflowId === workflowId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, []);
  
  // Get recent executions
  const getRecentExecutions = useCallback((limit = 10): WorkflowExecution[] => {
    return [...executionsStore]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }, []);
  
  // Clear execution history
  const clearExecutions = useCallback((): boolean => {
    executionsStore = [];
    return saveToLocalStorage();
  }, [saveToLocalStorage]);
  
  // Get execution by ID
  const getExecutionById = useCallback((executionId: string): WorkflowExecution | undefined => {
    return executionsStore.find(e => e.id === executionId);
  }, []);
  
  // Refresh all executions
  const refreshExecutions = useCallback(async (): Promise<boolean> => {
    try {
      // Find executions that need refreshing
      const runningExecutions = executionsStore
        .filter(e => e.status === 'running')
        .slice(0, 10); // Limit to 10
      
      // Check status for each running execution
      for (const execution of runningExecutions) {
        await checkExecutionStatus(execution.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing executions:', error);
      return false;
    }
  }, [checkExecutionStatus]);
  
  // Execute a batch of workflows
  const executeBatch = useCallback(async (
    workflows: Workflow[],
    parameters: Record<string, Record<string, any>> = {}
  ): Promise<{
    success: boolean;
    results: Array<{ workflowId: string; executionId: string; success: boolean; }>
  }> => {
    const results = [];
    let overallSuccess = true;
    
    for (const workflow of workflows) {
      try {
        // Get parameters for this workflow or use empty object
        const workflowParams = parameters[workflow.id] || {};
        
        // Execute workflow with the specialized method
        const result = await executeSpecializedWorkflow(workflow, workflowParams);
        
        results.push({
          workflowId: workflow.id,
          executionId: result.executionId,
          success: result.success
        });
        
        if (!result.success) {
          overallSuccess = false;
        }
      } catch (error) {
        console.error(`Error executing workflow ${workflow.id}:`, error);
        results.push({
          workflowId: workflow.id,
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
  }, [executeSpecializedWorkflow]);
  
  return {
    executeWorkflow: executeSpecializedWorkflow, // Use the specialized method as the default
    checkExecutionStatus,
    getExecutionsByWorkflowId,
    getRecentExecutions,
    clearExecutions,
    getExecutionById,
    refreshExecutions,
    executeBatch,
    syncWithLocalStorage,
    isPolling
  };
}; 