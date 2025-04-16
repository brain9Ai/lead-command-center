import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  Workflow, 
  WorkflowExecutionStatus, 
  WorkflowExecution, 
  WorkflowTriggerResponse,
  WorkflowStatus,
  WorkflowExecutionStatus as WorkflowExecutionStatusEnum
} from '../types';
import { N8N_BASE_URL, API_TIMEOUT } from '../../../config';

// Interface to handle the return type of status functions
interface ExecutionStatusResponse {
  executionId: string;
  status: string | WorkflowExecutionStatusEnum;
  workflowId?: string;
  startTime?: string;
  endTime?: string;
  success: boolean;
  message: string;
  data?: any;
  error?: Error;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: N8N_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Service for interacting with workflow APIs
 */
export const workflowApiService = {
  /**
   * Trigger a workflow execution via webhook
   * @param workflow Workflow to trigger
   * @param parameters Parameters to pass to the workflow
   * @returns Response from the workflow trigger
   */
  async triggerWorkflow(
    workflow: Workflow, 
    parameters: Record<string, any> = {}
  ): Promise<WorkflowTriggerResponse> {
    try {
      const executionId = uuidv4();
      
      // Add execution tracking metadata to the parameters
      const enhancedParameters = {
        ...parameters,
        __metadata: {
          executionId,
          timestamp: new Date().toISOString(),
          source: 'lead-command-center'
        }
      };
      
      // Handle missing webhookUrl by constructing one from workflow id
      const webhookUrl = workflow.webhookUrl || 
        `${N8N_BASE_URL}/webhook/${workflow.id}`;
      
      const response = await apiClient.post(webhookUrl, enhancedParameters);

      return {
        success: true,
        executionId,
        message: 'Workflow triggered successfully',
        data: response.data
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        executionId: '', // Empty string instead of null
        message: axiosError.message || 'Failed to trigger workflow',
        error: axiosError
      };
    }
  },

  /**
   * Check the status of a workflow execution
   * @param executionId ID of the workflow execution to check
   * @returns Status of the workflow execution
   */
  async checkExecutionStatus(executionId: string): Promise<ExecutionStatusResponse> {
    try {
      // In a production implementation, this would call an API endpoint to get the status
      // Since we're working in a stateless manner, we'll implement a simulated check
      // that uses local storage to track status
      
      // Check if there's a stored status for this execution
      const storedStatusStr = localStorage.getItem(`execution_status_${executionId}`);
      
      if (storedStatusStr) {
        try {
          const storedStatus = JSON.parse(storedStatusStr);
          return {
            executionId,
            status: storedStatus.status,
            startTime: storedStatus.startTime,
            endTime: storedStatus.endTime,
            workflowId: storedStatus.workflowId,
            success: true,
            message: 'Status retrieved from local storage',
            data: storedStatus
          };
        } catch (parseError) {
          console.error('Failed to parse stored status:', parseError);
        }
      }
      
      // If we don't have a stored status or it couldn't be parsed,
      // use a fallback method to check status via API
      // In a real implementation with a stateful backend, this would call
      // the appropriate API endpoint
      
      try {
        const response = await apiClient.get(`/webhook/execution-status/${executionId}`);
        
        // Store the status for future reference
        const statusData = {
          executionId,
          status: response.data.status,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
          workflowId: response.data.workflowId
        };
        
        localStorage.setItem(`execution_status_${executionId}`, JSON.stringify(statusData));
        
        return {
          executionId,
          status: response.data.status,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
          workflowId: response.data.workflowId,
          success: true,
          message: 'Status retrieved successfully',
          data: response.data
        };
      } catch (apiError) {
        // If API call fails, return unknown status
        console.warn('Failed to check status via API:', apiError);
        return {
          executionId,
          status: 'unknown',
          startTime: new Date().toISOString(),
          success: false,
          message: 'Failed to retrieve execution status',
          error: apiError as Error
        };
      }
    } catch (error) {
      // Final error handler
      return {
        executionId,
        status: 'unknown',
        startTime: new Date().toISOString(),
        success: false,
        message: 'Failed to retrieve execution status',
        error: error as Error
      };
    }
  },

  /**
   * Update the status of a workflow execution (would be called by a webhook handler in a real implementation)
   * For now, we simulate by updating local storage
   */
  updateExecutionStatus(
    executionId: string,
    status: WorkflowStatus,
    workflowId: string,
    startTime?: string,
    endTime?: string
  ): void {
    const currentTimeISOString = new Date().toISOString();
    
    // Create or update status in local storage
    const statusData = {
      executionId,
      status,
      workflowId,
      startTime: startTime || currentTimeISOString,
      endTime: status === 'completed' || status === 'failed' ? (endTime || currentTimeISOString) : undefined
    };
    
    localStorage.setItem(`execution_status_${executionId}`, JSON.stringify(statusData));
    
    // Dispatch a custom event so components can update
    window.dispatchEvent(new CustomEvent('workflow_status_update', { 
      detail: { executionId, status, workflowId }
    }));
  },

  /**
   * Fetch all recent workflow executions
   * @returns List of workflow executions
   */
  async getRecentExecutions(): Promise<WorkflowExecution[]> {
    try {
      // In a real implementation, this would call an API endpoint to get recent executions
      // For now, we'll return an empty array
      const response = await apiClient.get('/webhook/executions/recent');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent executions:', error);
      return [];
    }
  },

  /**
   * Simulates webhook callbacks from n8n for workflow status updates
   * In a real implementation, this would be handled by a webhook endpoint
   * Here we're just exposing methods that simulate webhook callbacks
   */
  simulateWebhooks: {
    /**
     * Simulate a webhook callback for workflow started
     * @param executionId ID of the workflow execution
     * @param workflowId ID of the workflow
     */
    workflowStarted(executionId: string, workflowId: string): ExecutionStatusResponse {
      const startTime = new Date().toISOString();
      
      // Update the execution status in local storage
      workflowApiService.updateExecutionStatus(
        executionId,
        'running',
        workflowId,
        startTime
      );
      
      return {
        executionId,
        workflowId,
        status: 'running',
        startTime,
        success: true,
        message: 'Workflow execution started'
      };
    },

    /**
     * Simulate a webhook callback for workflow completed
     * @param executionId ID of the workflow execution
     * @param workflowId ID of the workflow
     * @param success Whether the workflow execution was successful
     */
    workflowCompleted(
      executionId: string, 
      workflowId: string, 
      success: boolean = true
    ): ExecutionStatusResponse {
      const endTime = new Date().toISOString();
      const status = success ? 'completed' : 'failed';
      
      // Get the existing status to preserve the start time
      const storedStatusStr = localStorage.getItem(`execution_status_${executionId}`);
      let startTime = new Date(Date.now() - 5000).toISOString(); // Default to 5 seconds ago
      
      if (storedStatusStr) {
        try {
          const storedStatus = JSON.parse(storedStatusStr);
          startTime = storedStatus.startTime || startTime;
        } catch (error) {
          console.error('Failed to parse stored status:', error);
        }
      }
      
      // Update the execution status in local storage
      workflowApiService.updateExecutionStatus(
        executionId,
        status,
        workflowId,
        startTime,
        endTime
      );
      
      return {
        executionId,
        workflowId,
        status,
        startTime,
        endTime,
        success: true,
        message: `Workflow execution ${success ? 'completed successfully' : 'failed'}`
      };
    }
  }
}; 