export type WorkflowCategory = 
  | 'Lead Generation'
  | 'Lead Qualification'
  | 'Lead Enrichment'
  | 'AI Personalization'
  | 'Replies & Follow-ups'
  | 'Campaign Management'
  | 'Data Integration'
  | 'Analytics & Reporting';

// Legacy status type (string-based)
export type WorkflowStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'unknown';

// New enum-based status for better type safety
export enum WorkflowExecutionStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  UNKNOWN = 'unknown'
}

// Map to convert n8n status values to our application statuses
export const ExecutionStatusMap: Record<string, WorkflowExecutionStatus> = {
  'new': WorkflowExecutionStatus.PENDING,
  'waiting': WorkflowExecutionStatus.PENDING,
  'running': WorkflowExecutionStatus.RUNNING,
  'success': WorkflowExecutionStatus.COMPLETED,
  'completed': WorkflowExecutionStatus.COMPLETED,
  'error': WorkflowExecutionStatus.FAILED,
  'failed': WorkflowExecutionStatus.FAILED,
  'cancelled': WorkflowExecutionStatus.CANCELLED,
  'timeout': WorkflowExecutionStatus.FAILED
};

export interface WorkflowParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'apikey';
  default: any;
  required: boolean;
  description?: string;
  options?: Array<{ label: string; value: any }>;
  format?: string; // Optional format hint (e.g., 'date', 'email', 'url', 'json', etc.)
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  parameters?: WorkflowParameter[];
  webhookUrl?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus | WorkflowExecutionStatus;
  startTime: string;
  endTime?: string | null;
  parameters: Record<string, any>;
  result: any;
  error: string | null;
}

export interface WorkflowTriggerResponse {
  success: boolean;
  executionId: string;
  message?: string;
  data?: any;
  error?: any;
}

export interface WorkflowExecutionStore {
  executions: Record<string, WorkflowExecution>;
  getById(id: string): WorkflowExecution | undefined;
  getByWorkflowId(workflowId: string): WorkflowExecution[];
  getRecent(limit?: number): WorkflowExecution[];
  add(execution: Omit<WorkflowExecution, 'id'> & { id?: string }): WorkflowExecution;
  update(id: string, updates: Partial<WorkflowExecution>): void;
  clear(): void;
  onStatusUpdate(handler: (execution: WorkflowExecution) => void): () => void;
  syncWithLocalStorage(): void;
} 