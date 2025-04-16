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

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  parameters?: Record<string, any>;
} 