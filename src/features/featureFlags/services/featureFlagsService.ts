import { Feature, FeatureID, FeaturesState, ReleasePhase } from '../types';

// Initial state of all features
const initialFeatures: FeaturesState = {
  [FeatureID.WORKFLOW_TRIGGER]: {
    id: FeatureID.WORKFLOW_TRIGGER,
    name: 'Workflow Trigger',
    description: 'Launch specific workflows on demand with simple controls',
    enabled: true,
    releasePhase: ReleasePhase.INITIAL
  },
  [FeatureID.STATUS_MONITORING]: {
    id: FeatureID.STATUS_MONITORING,
    name: 'Status Monitoring',
    description: 'View current workflow execution status',
    enabled: true,
    releasePhase: ReleasePhase.INITIAL
  },
  [FeatureID.WEBHOOK_INTEGRATION]: {
    id: FeatureID.WEBHOOK_INTEGRATION,
    name: 'Webhook Integration',
    description: 'Connect to your existing systems via secure webhooks',
    enabled: true,
    releasePhase: ReleasePhase.INITIAL
  },
  [FeatureID.WORKFLOW_PARAMETERIZATION]: {
    id: FeatureID.WORKFLOW_PARAMETERIZATION,
    name: 'Workflow Parameterization',
    description: 'Configure workflow parameters before execution',
    enabled: true,
    releasePhase: ReleasePhase.INITIAL
  },
  [FeatureID.USER_MANAGEMENT]: {
    id: FeatureID.USER_MANAGEMENT,
    name: 'User Management',
    description: 'Control access levels and permissions for team members',
    enabled: true, // Enabled by default for initial release
    releasePhase: ReleasePhase.INITIAL
  },
  [FeatureID.ADVANCED_DASHBOARD]: {
    id: FeatureID.ADVANCED_DASHBOARD,
    name: 'Advanced Dashboard',
    description: 'Detailed performance metrics and real-time system status',
    enabled: false,
    releasePhase: ReleasePhase.SECOND
  },
  [FeatureID.ANALYTICS_REPORTING]: {
    id: FeatureID.ANALYTICS_REPORTING,
    name: 'Analytics & Reporting',
    description: 'Comprehensive data visualization and custom reporting',
    enabled: false,
    releasePhase: ReleasePhase.SECOND
  },
  [FeatureID.CAMPAIGN_MANAGEMENT]: {
    id: FeatureID.CAMPAIGN_MANAGEMENT,
    name: 'Campaign Management',
    description: 'Advanced setup and management of ongoing campaigns',
    enabled: false,
    releasePhase: ReleasePhase.THIRD
  },
  [FeatureID.RESULTS_VISUALIZATION]: {
    id: FeatureID.RESULTS_VISUALIZATION,
    name: 'Results Visualization',
    description: 'Detailed tracking of success metrics and conversion rates',
    enabled: false,
    releasePhase: ReleasePhase.THIRD
  }
};

// Store features in localStorage to persist between sessions
const FEATURES_STORAGE_KEY = 'lead_command_center_features';

// Get features from localStorage or use initial state
const loadFeaturesFromStorage = (): FeaturesState => {
  try {
    const storedFeatures = localStorage.getItem(FEATURES_STORAGE_KEY);
    if (storedFeatures) {
      return JSON.parse(storedFeatures);
    }
  } catch (error) {
    console.error('Failed to load features from storage:', error);
  }
  
  // If nothing found in storage or error, use initial state
  return initialFeatures;
};

// Save features to localStorage
const saveFeaturestoStorage = (features: FeaturesState): void => {
  try {
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(features));
  } catch (error) {
    console.error('Failed to save features to storage:', error);
  }
};

// Initialize features in storage if not already there
const initializeFeatures = (): FeaturesState => {
  const existingFeatures = loadFeaturesFromStorage();
  
  // Only save to storage if we're using the initial features
  if (existingFeatures === initialFeatures) {
    saveFeaturestoStorage(initialFeatures);
  }
  
  return existingFeatures;
};

// Feature flag service
export const featureFlagsService = {
  // Get all features
  getAllFeatures(): FeaturesState {
    return loadFeaturesFromStorage();
  },
  
  // Check if a specific feature is enabled
  isFeatureEnabled(featureId: FeatureID): boolean {
    const features = loadFeaturesFromStorage();
    return features[featureId]?.enabled || false;
  },
  
  // Enable a specific feature
  enableFeature(featureId: FeatureID): void {
    const features = loadFeaturesFromStorage();
    
    if (features[featureId]) {
      features[featureId].enabled = true;
      saveFeaturestoStorage(features);
    }
  },
  
  // Disable a specific feature
  disableFeature(featureId: FeatureID): void {
    const features = loadFeaturesFromStorage();
    
    if (features[featureId]) {
      features[featureId].enabled = false;
      saveFeaturestoStorage(features);
    }
  },
  
  // Enable features by release phase
  enableFeaturesByPhase(phase: ReleasePhase): void {
    const features = loadFeaturesFromStorage();
    
    Object.values(features).forEach(feature => {
      if (feature.releasePhase === phase) {
        features[feature.id].enabled = true;
      }
    });
    
    saveFeaturestoStorage(features);
  },
  
  // Reset all features to their initial state
  resetFeatures(): void {
    saveFeaturestoStorage(initialFeatures);
  },
  
  // Initialize feature flags (call this when app starts)
  initialize(): void {
    initializeFeatures();
  }
};

// Initialize on import
featureFlagsService.initialize(); 