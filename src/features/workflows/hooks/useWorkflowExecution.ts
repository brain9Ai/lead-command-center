import { useState, useCallback, useEffect } from 'react';
import { Workflow } from '../types';
import { workflowApi } from '../../../services/api/workflowApi';
import { apiConfig, getWebhookId } from '../../../config/apiConfig';

/**
 * Hook for executing workflows
 * Simplified to only handle direct execution with immediate response
 */
export const useWorkflowExecution = () => {
  const [executing, setExecuting] = useState(false);
  const [lastWorkflowMessage, setLastWorkflowMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  
  // Initialize hook
  useEffect(() => {
    console.log('useWorkflowExecution hook initialized');
  }, []);
  
  /**
   * Execute a workflow with parameters
   * @param workflow The workflow to execute
   * @param parameters Parameters for the workflow
   * @returns Object with success status and message
   */
  const executeWorkflow = useCallback(async (
    workflow: Workflow,
    parameters: Record<string, any> = {}
  ): Promise<{ success: boolean; message: string }> => {
    setExecuting(true);
    setLastWorkflowMessage(null);
    
    try {
      // Get the webhook ID for this workflow
      // const webhookId = getWebhookId(workflow.name, workflow.category);
      const webhookId = workflow.webhookUrl? workflow.webhookUrl : '/webhook/' + getWebhookId(workflow.name, workflow.category);
      console.log(`Executing workflow: ${workflow.name} using webhook ID: ${webhookId}`);
      
      // Execute the workflow using the API
      const result = await workflowApi.triggerWorkflow(webhookId, parameters);
      
      // Set success message
      setLastWorkflowMessage({
        type: result.success ? 'success' : 'error',
        text: result.message || (result.success 
          ? `${workflow.name} started successfully` 
          : `Failed to start ${workflow.name}`)
      });
      
      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      console.error('Error executing workflow:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setLastWorkflowMessage({
        type: 'error',
        text: `Error: ${errorMessage}`
      });
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setExecuting(false);
    }
  }, []);
  
  // Return only the functions and state needed for workflow execution
  return {
    executeWorkflow,
    executing,
    lastWorkflowMessage
  };
}; 