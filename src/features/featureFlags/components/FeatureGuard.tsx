import React from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { FeatureID } from '../types';

interface FeatureGuardProps {
  featureId: FeatureID;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on whether a feature is enabled
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  featureId,
  children,
  fallback = null
}) => {
  const { isEnabled } = useFeatureFlags();
  
  return isEnabled(featureId) ? <>{children}</> : <>{fallback}</>;
}; 