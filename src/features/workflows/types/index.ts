export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  webhookUrl: string;
  parameters?: WorkflowParameter[];
}

export enum WorkflowCategory {
  LeadGeneration = "Lead Generation",
  LeadQualification = "Lead Qualification",
  LeadEnrichment = "Lead Enrichment",
  AIPersonalization = "AI Personalization",
  RepliesAndFollowups = "Replies & Follow-ups",
  CampaignManagement = "Campaign Management",
  DataIntegration = "Data Integration",
  AnalyticsReporting = "Analytics & Reporting"
}

export interface WorkflowParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  label: string;
  required: boolean;
  default?: any;
  description?: string;
}

export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed' | 'unknown';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  startTime: string;
  endTime?: string;
  parameters?: Record<string, any>;
  result?: any;
  error?: string | null;
}

export interface WorkflowTriggerResponse {
  success: boolean;
  executionId: string | null;
  message: string;
  data?: any;
  error?: any;
}

export interface WorkflowExecutionStatus {
  executionId: string;
  workflowId?: string;
  status: WorkflowStatus;
  startTime: string;
  endTime?: string;
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

// Interface for webhook payload when workflow execution starts
export interface WorkflowStartWebhookPayload {
  executionId: string;
  workflowId: string;
  startTime: string;
  parameters?: Record<string, any>;
}

// Interface for webhook payload when workflow execution completes
export interface WorkflowCompleteWebhookPayload {
  executionId: string;
  workflowId: string;
  status: 'completed' | 'failed';
  startTime: string;
  endTime: string;
  result?: any;
  error?: any;
}

// Store for tracking workflow executions
export interface WorkflowExecutionStore {
  executions: Record<string, WorkflowExecution>;
  getById: (id: string) => WorkflowExecution | undefined;
  getByWorkflowId: (workflowId: string) => WorkflowExecution[];
  getRecent: (limit?: number) => WorkflowExecution[];
  add: (execution: Omit<WorkflowExecution, 'id'> & { id?: string }) => WorkflowExecution;
  update: (id: string, updates: Partial<WorkflowExecution>) => void;
  clear: () => void;
  onStatusUpdate: (handler: (execution: WorkflowExecution) => void) => () => void;
  syncWithLocalStorage: () => WorkflowExecution[];
} 