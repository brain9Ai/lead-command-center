import { v4 as uuidv4 } from 'uuid';
import { WorkflowExecution, WorkflowExecutionStore, WorkflowStatus } from '../types';

// Storage key for workflow executions
const EXECUTIONS_STORAGE_KEY = 'lead_command_center_workflow_executions';

// Maximum number of executions to store in localStorage
const MAX_STORED_EXECUTIONS = 50;

// Load executions from localStorage
const loadExecutionsFromStorage = (): Record<string, WorkflowExecution> => {
  try {
    const storedExecutions = localStorage.getItem(EXECUTIONS_STORAGE_KEY);
    if (storedExecutions) {
      return JSON.parse(storedExecutions);
    }
  } catch (error) {
    console.error('Failed to load workflow executions from storage:', error);
  }
  
  return {};
};

// Save executions to localStorage
const saveExecutionsToStorage = (executions: Record<string, WorkflowExecution>): void => {
  try {
    // Limit the number of stored executions to prevent localStorage from getting too large
    const executionList = Object.values(executions)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, MAX_STORED_EXECUTIONS);
    
    const limitedExecutions: Record<string, WorkflowExecution> = {};
    executionList.forEach(execution => {
      limitedExecutions[execution.id] = execution;
    });
    
    localStorage.setItem(EXECUTIONS_STORAGE_KEY, JSON.stringify(limitedExecutions));
  } catch (error) {
    console.error('Failed to save workflow executions to storage:', error);
  }
};

// Create and initialize workflow execution store
export const createWorkflowExecutionStore = (): WorkflowExecutionStore => {
  // Initialize with stored executions or empty object
  let executionsStore: Record<string, WorkflowExecution> = loadExecutionsFromStorage();
  
  // Array to store status update handlers
  const statusUpdateHandlers: Array<(execution: WorkflowExecution) => void> = [];
  
  // Listen for status update events
  const listenForStatusUpdates = () => {
    window.addEventListener('workflow_status_update', ((event: CustomEvent) => {
      const { executionId, status, workflowId } = event.detail;
      
      // Get the existing execution or create a new one
      const existingExecution = executionsStore[executionId];
      
      if (existingExecution) {
        // Update existing execution with new status
        const updatedExecution = {
          ...existingExecution,
          status,
          endTime: status === 'completed' || status === 'failed' 
            ? new Date().toISOString() 
            : existingExecution.endTime
        };
        
        executionsStore = {
          ...executionsStore,
          [executionId]: updatedExecution
        };
        
        saveExecutionsToStorage(executionsStore);
        
        // Notify handlers
        statusUpdateHandlers.forEach(handler => handler(updatedExecution));
      } else {
        // Create a new execution if it doesn't exist in our store
        const storedStatusStr = localStorage.getItem(`execution_status_${executionId}`);
        
        if (storedStatusStr) {
          try {
            const storedStatus = JSON.parse(storedStatusStr);
            
            const newExecution: WorkflowExecution = {
              id: executionId,
              workflowId: storedStatus.workflowId || 'unknown',
              status: storedStatus.status || 'unknown',
              startTime: storedStatus.startTime || new Date().toISOString(),
              endTime: storedStatus.endTime,
              parameters: {},
              result: null,
              error: null
            };
            
            executionsStore = {
              ...executionsStore,
              [executionId]: newExecution
            };
            
            saveExecutionsToStorage(executionsStore);
            
            // Notify handlers
            statusUpdateHandlers.forEach(handler => handler(newExecution));
          } catch (error) {
            console.error('Failed to parse stored status:', error);
          }
        }
      }
    }) as EventListener);
  };
  
  // Initialize event listener
  listenForStatusUpdates();
  
  // Return the store interface
  const store: WorkflowExecutionStore = {
    get executions() {
      return executionsStore;
    },
    
    getById(id: string) {
      return executionsStore[id];
    },
    
    getByWorkflowId(workflowId: string) {
      return Object.values(executionsStore)
        .filter(execution => execution.workflowId === workflowId)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    },
    
    getRecent(limit = 10) {
      return Object.values(executionsStore)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, limit);
    },
    
    add(execution: Omit<WorkflowExecution, 'id'> & { id?: string }) {
      const id = execution.id || uuidv4();
      const newExecution: WorkflowExecution = {
        ...execution,
        id,
        status: execution.status || 'idle'
      } as WorkflowExecution;
      
      executionsStore = {
        ...executionsStore,
        [id]: newExecution
      };
      
      saveExecutionsToStorage(executionsStore);
      return newExecution;
    },
    
    update(id: string, updates: Partial<WorkflowExecution>) {
      const execution = executionsStore[id];
      
      if (!execution) {
        console.warn(`Cannot update execution with ID ${id} because it doesn't exist`);
        return;
      }
      
      const updatedExecution = {
        ...execution,
        ...updates
      };
      
      executionsStore = {
        ...executionsStore,
        [id]: updatedExecution
      };
      
      saveExecutionsToStorage(executionsStore);
      
      // Notify handlers of the update
      statusUpdateHandlers.forEach(handler => handler(updatedExecution));
    },
    
    clear() {
      executionsStore = {};
      saveExecutionsToStorage(executionsStore);
    },
    
    // Subscribe to status updates
    onStatusUpdate(handler: (execution: WorkflowExecution) => void) {
      statusUpdateHandlers.push(handler);
      
      // Return unsubscribe function
      return () => {
        const index = statusUpdateHandlers.indexOf(handler);
        if (index !== -1) {
          statusUpdateHandlers.splice(index, 1);
        }
      };
    },
    
    // Sync with local storage status data
    syncWithLocalStorage() {
      saveExecutionsToStorage(executionsStore);
      return Object.values(executionsStore);
    }
  };

  return store;
};

// Singleton instance of the workflow execution store
export const workflowExecutionStore = createWorkflowExecutionStore(); 