import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Workflow, WorkflowExecution, WorkflowStatus } from '../types';
import { workflowApi } from '../../../services/api/workflowApi';
import { apiConfig } from '../../../config/apiConfig';

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
  
  // Initialize event source and polling on mount
  useEffect(() => {
    // Load saved executions from localStorage
    syncWithLocalStorage().then(() => {
      // Set up event source for real-time updates
      const cleanupEventSource = setupEventSource();
      
      // Set up polling for workflow status updates
      const cleanupPolling = setupPolling();
      
      // Return cleanup function
      return () => {
        cleanupEventSource();
        cleanupPolling();
      };
    });
  }, [syncWithLocalStorage, setupEventSource, setupPolling]);
  
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
      // Trigger the workflow via the API
      const result = await workflowApi.triggerWorkflow(workflow.id, parameters);
      
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
          executionId: newExecution.id
        };
      }
    } catch (error: any) {
      console.error('Error executing workflow:', error);
      
      // Create a failed execution record
      const newExecution: WorkflowExecution = {
        id: uuidv4(),
        workflowId: workflow.id,
        status: 'failed',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        parameters,
        result: null,
        error: error.message || 'An error occurred while executing the workflow'
      };
      
      // Update the store
      updateExecution(newExecution);
      
      return {
        success: false,
        executionId: newExecution.id
      };
    }
  }, [updateExecution]);
  
  // Execute multiple workflows in batch
  const executeBatch = useCallback(async (
    workflows: Workflow[],
    parameters: Record<string, any> = {}
  ): Promise<{ success: boolean; executionIds: string[] }> => {
    const executionIds: string[] = [];
    let allSuccessful = true;
    
    for (const workflow of workflows) {
      const result = await executeWorkflow(workflow, parameters);
      
      if (result.success) {
        executionIds.push(result.executionId);
      } else {
        allSuccessful = false;
      }
    }
    
    return {
      success: allSuccessful,
      executionIds
    };
  }, [executeWorkflow]);
  
  // Check the status of an execution
  const checkExecutionStatus = useCallback(async (executionId: string): Promise<WorkflowExecution | null> => {
    try {
      // Find the execution in the store
      const existingExecution = executionsStore.find(e => e.id === executionId);
      
      if (!existingExecution) {
        console.error(`No execution found with ID ${executionId}`);
        return null;
      }
      
      // Check status via API
      const statusResult = await workflowApi.checkExecutionStatus(executionId);
      
      if (statusResult) {
        // Create a complete WorkflowExecution object by merging the result with existing data
        const updatedExecution: WorkflowExecution = {
          ...existingExecution,
          status: statusResult.status as WorkflowStatus
        };
        
        if (statusResult.data) {
          updatedExecution.result = statusResult.data;
        }
        
        // Update the execution in the store
        updateExecution(updatedExecution);
        return updatedExecution;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking execution status:', error);
      return null;
    }
  }, [updateExecution]);
  
  // Get recent executions
  const getRecentExecutions = useCallback((limit: number = 10): WorkflowExecution[] => {
    return [...executionsStore]
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }, []);
  
  // Get executions for a specific workflow
  const getExecutionsByWorkflowId = useCallback((workflowId: string): WorkflowExecution[] => {
    return [...executionsStore]
      .filter(execution => execution.workflowId === workflowId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, []);
  
  // Clear all executions
  const clearExecutions = useCallback(() => {
    executionsStore = [];
    saveToLocalStorage();
    setStatusUpdateCount(prev => prev + 1);
  }, [saveToLocalStorage]);
  
  // Refresh executions (trigger re-render)
  const refreshExecutions = useCallback(() => {
    setStatusUpdateCount(prev => prev + 1);
  }, []);
  
  return {
    executeWorkflow,
    executeBatch,
    checkExecutionStatus,
    getRecentExecutions,
    getExecutionsByWorkflowId,
    clearExecutions,
    refreshExecutions,
    syncWithLocalStorage,
    isPolling
  };
}; 