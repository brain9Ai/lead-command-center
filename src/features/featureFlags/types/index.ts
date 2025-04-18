/**
 * Feature flag types for the Lead Command Center
 */

export enum FeatureID {
  // Core functionality - always enabled
  WORKFLOW_TRIGGER = 'workflow_trigger',
  STATUS_MONITORING = 'status_monitoring',
  WEBHOOK_INTEGRATION = 'webhook_integration',

  // optional features
  WORKFLOW_PARAMETERIZATION = 'workflow_parameterization',
  
  // User Management
  USER_MANAGEMENT = 'user_management',
  
  // Future features
  ADVANCED_DASHBOARD = 'advanced_dashboard',
  ANALYTICS_REPORTING = 'analytics_reporting',
  CAMPAIGN_MANAGEMENT = 'campaign_management',
  RESULTS_VISUALIZATION = 'results_visualization'
}

export interface Feature {
  id: FeatureID;
  name: string;
  description: string;
  enabled: boolean;
  releasePhase: ReleasePhase;
}

export enum ReleasePhase {
  INITIAL = 'Initial Phase (Core Functionality)',
  SECOND = 'Second Phase',
  THIRD = 'Third Phase'
}

export type FeaturesState = Record<FeatureID, Feature>; 