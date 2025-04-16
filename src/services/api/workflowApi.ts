import { v4 as uuidv4 } from 'uuid';
import { 
  WorkflowStatus,
  WorkflowExecutionStatus as WorkflowExecutionStatusType 
} from '../../features/workflows/types';
import { apiConfig } from '../../config/apiConfig';

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
      
      // Construct the webhook URL using configuration
      const webhookUrl = `${apiConfig.n8nBaseUrl}${apiConfig.webhooks.triggerWebhook}/${workflowId}`;
      
      // Make the API call to trigger the workflow
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger workflow: ${response.statusText}`);
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
      const statusUrl = `${apiConfig.n8nBaseUrl}/api/executions/${executionId}`;
      
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
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
    // Create a new EventSource connection to the status updates endpoint
    const eventSource = new EventSource(
      `${apiConfig.n8nBaseUrl}/api/events/workflow/${executionId}`
    );
    
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
          eventSource.close();
        }
      } catch (error) {
        console.error('Error processing status update:', error);
      }
    };
    
    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error('Status listener connection error:', error);
      eventSource.close();
    };
    
    // Return a cleanup function
    return () => {
      eventSource.close();
    };
  },
}; 