import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Workflow, WorkflowExecution } from '../types/workflows';
import { API_TIMEOUT, DEFAULT_PARAMETERS } from '../config';

interface ExecutionBatch {
  id: string;
  workflowIds: string[];
  status: 'queued' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  progress: number; // 0-100
  executionIds: string[]; // IDs of individual executions in this batch
}

export const useWorkflowExecutions = (workflows: Workflow[]) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [batches, setBatches] = useState<ExecutionBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load execution history from localStorage on init
  useEffect(() => {
    try {
      const savedExecutions = localStorage.getItem('workflowExecutions');
      const savedBatches = localStorage.getItem('executionBatches');
      
      if (savedExecutions) {
        const parsed = JSON.parse(savedExecutions);
        // Convert string dates back to Date objects
        const executionsWithDates = parsed.map((exec: any) => ({
          ...exec,
          startTime: new Date(exec.startTime),
          endTime: exec.endTime ? new Date(exec.endTime) : undefined
        }));
        setExecutions(executionsWithDates);
      }
      
      if (savedBatches) {
        const parsed = JSON.parse(savedBatches);
        // Convert string dates back to Date objects
        const batchesWithDates = parsed.map((batch: any) => ({
          ...batch,
          startTime: new Date(batch.startTime),
          endTime: batch.endTime ? new Date(batch.endTime) : undefined
        }));
        setBatches(batchesWithDates);
      }
    } catch (err) {
      console.error('Failed to load execution history', err);
    }
  }, []);
  
  // Save executions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workflowExecutions', JSON.stringify(executions));
  }, [executions]);
  
  // Save batches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('executionBatches', JSON.stringify(batches));
  }, [batches]);

  const executeWorkflow = async (workflowId: string, parameters: Record<string, any> = {}, batchId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }
      
      // Create a new execution record
      const executionId = uuidv4();
      const newExecution: WorkflowExecution = {
        id: executionId,
        workflowId,
        status: 'running',
        startTime: new Date(),
        parameters
      };
      
      setExecutions(prev => [...prev, newExecution]);
      
      // If this execution is part of a batch, update the batch
      if (batchId) {
        setBatches(prev => 
          prev.map(batch => 
            batch.id === batchId 
              ? { 
                  ...batch, 
                  executionIds: [...batch.executionIds, executionId],
                  progress: calculateBatchProgress(batch.workflowIds.length, batch.executionIds.length + 1)
                } 
              : batch
          )
        );
      }
      
      try {
        // Make the actual API call to the workflow webhook
        const response = await axios.post(workflow.webhookUrl, parameters, {
          timeout: API_TIMEOUT
        });
        
        console.log(`Workflow ${workflowId} executed with response:`, response.data);
        
        // Update the execution status
        setExecutions(prev => 
          prev.map(exec => 
            exec.id === executionId 
              ? { ...exec, status: 'completed', endTime: new Date() } 
              : exec
          )
        );
        
        // If this was part of a batch, check if the batch is complete
        if (batchId) {
          updateBatchStatus(batchId);
        }
        
        return { success: true, executionId, data: response.data };
      } catch (apiError: any) {
        console.error(`API error for workflow ${workflowId}:`, apiError);
        
        setExecutions(prev => 
          prev.map(exec => 
            exec.id === executionId 
              ? { ...exec, status: 'failed', endTime: new Date() } 
              : exec
          )
        );
        
        // If this was part of a batch, update the batch
        if (batchId) {
          updateBatchStatus(batchId);
        }
        
        throw new Error(`API error: ${apiError.message}`);
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const executeBatch = async (workflowIds: string[], parametersList?: Record<string, any>[]) => {
    if (workflowIds.length === 0) {
      return { success: false, error: 'No workflows specified for batch execution', batchId: null };
    }
    
    // Create a new batch
    const batchId = uuidv4();
    const newBatch: ExecutionBatch = {
      id: batchId,
      workflowIds,
      status: 'running',
      startTime: new Date(),
      progress: 0,
      executionIds: []
    };
    
    setBatches(prev => [...prev, newBatch]);
    
    try {
      const results = [];
      
      for (let i = 0; i < workflowIds.length; i++) {
        const workflowId = workflowIds[i];
        const workflow = workflows.find(w => w.id === workflowId);
        
        if (!workflow) {
          console.error(`Workflow ${workflowId} not found, skipping in batch`);
          continue;
        }
        
        // Get parameters for this workflow
        const parameters = parametersList && parametersList[i] 
          ? parametersList[i] 
          : DEFAULT_PARAMETERS[workflowId as keyof typeof DEFAULT_PARAMETERS] || {};
        
        const result = await executeWorkflow(workflowId, parameters, batchId);
        results.push({ workflowId, result });
      }
      
      return { success: true, batchId, results };
    } catch (err: any) {
      // The batch status will already be updated by individual workflow executions
      return { success: false, batchId, error: err.message };
    }
  };

  // Calculate batch progress percentage
  const calculateBatchProgress = (totalWorkflows: number, completedWorkflows: number) => {
    return Math.round((completedWorkflows / totalWorkflows) * 100);
  };

  // Update batch status based on individual executions
  const updateBatchStatus = (batchId: string) => {
    setBatches(prev => {
      const batch = prev.find(b => b.id === batchId);
      if (!batch) return prev;
      
      const batchExecutions = executions.filter(e => batch.executionIds.includes(e.id));
      const allCompleted = batchExecutions.every(e => e.status === 'completed' || e.status === 'failed');
      const anyFailed = batchExecutions.some(e => e.status === 'failed');
      
      const completedCount = batchExecutions.filter(e => e.status === 'completed' || e.status === 'failed').length;
      const progress = calculateBatchProgress(batch.workflowIds.length, completedCount);
      
      if (allCompleted) {
        return prev.map(b => 
          b.id === batchId
            ? { 
                ...b, 
                status: anyFailed ? 'failed' : 'completed', 
                endTime: new Date(),
                progress
              }
            : b
        );
      } else {
        return prev.map(b => 
          b.id === batchId
            ? { ...b, progress }
            : b
        );
      }
    });
  };

  const getExecutionsByWorkflowId = (workflowId: string) => {
    return executions.filter(exec => exec.workflowId === workflowId);
  };

  const getExecutionsByBatchId = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return [];
    
    return executions.filter(exec => batch.executionIds.includes(exec.id));
  };

  const getLatestExecution = (workflowId: string) => {
    const workflowExecutions = getExecutionsByWorkflowId(workflowId);
    if (workflowExecutions.length === 0) return null;
    
    return workflowExecutions.reduce((latest, current) => {
      return new Date(current.startTime) > new Date(latest.startTime) ? current : latest;
    });
  };

  const clearExecutions = () => {
    setExecutions([]);
    setBatches([]);
    localStorage.removeItem('workflowExecutions');
    localStorage.removeItem('executionBatches');
  };

  return {
    executions,
    batches,
    loading,
    error,
    executeWorkflow,
    executeBatch,
    getExecutionsByWorkflowId,
    getExecutionsByBatchId,
    getLatestExecution,
    clearExecutions
  };
}; 