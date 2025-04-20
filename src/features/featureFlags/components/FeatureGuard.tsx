import React from 'react';
import { FeatureID } from '../types';
import { featureFlagsService } from '../services/featureFlagsService';

interface FeatureGuardProps {
  featureId: FeatureID;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on whether a feature flag is enabled
 */
const FeatureGuard: React.FC<FeatureGuardProps> = ({ 
  featureId, 
  children,
  fallback = null 
}) => {
  // For critical features like WORKFLOW_TRIGGER, always render children if this is the root route
  if (featureId === FeatureID.WORKFLOW_TRIGGER && window.location.pathname === '/') {
    console.log('FeatureGuard: Forcing WORKFLOW_TRIGGER to be enabled for root route');
    return <>{children}</>;
  }
  
  const isEnabled = featureFlagsService.isFeatureEnabled(featureId);
  
  console.log(`FeatureGuard: ${featureId} is ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
  
  // Check all features for debugging
  const allFeatures = featureFlagsService.getAllFeatures();
  console.log('All features status:', allFeatures);
  
  if (isEnabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default FeatureGuard; 