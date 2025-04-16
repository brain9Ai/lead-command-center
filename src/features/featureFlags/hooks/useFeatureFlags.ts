import { useState, useEffect, useCallback } from 'react';
import { Feature, FeatureID, FeaturesState, ReleasePhase } from '../types';
import { featureFlagsService } from '../services/featureFlagsService';

export const useFeatureFlags = () => {
  const [features, setFeatures] = useState<FeaturesState>(featureFlagsService.getAllFeatures());

  // Update state when features change (from localStorage or manually)
  const refreshFeatures = useCallback(() => {
    setFeatures(featureFlagsService.getAllFeatures());
  }, []);

  // Check if a feature is enabled
  const isEnabled = useCallback((featureId: FeatureID): boolean => {
    return featureFlagsService.isFeatureEnabled(featureId);
  }, []);

  // Enable a feature
  const enableFeature = useCallback((featureId: FeatureID): void => {
    featureFlagsService.enableFeature(featureId);
    refreshFeatures();
  }, [refreshFeatures]);

  // Disable a feature
  const disableFeature = useCallback((featureId: FeatureID): void => {
    featureFlagsService.disableFeature(featureId);
    refreshFeatures();
  }, [refreshFeatures]);

  // Toggle a feature
  const toggleFeature = useCallback((featureId: FeatureID): void => {
    if (isEnabled(featureId)) {
      disableFeature(featureId);
    } else {
      enableFeature(featureId);
    }
  }, [isEnabled, disableFeature, enableFeature]);

  // Enable features by phase
  const enableFeaturesByPhase = useCallback((phase: ReleasePhase): void => {
    featureFlagsService.enableFeaturesByPhase(phase);
    refreshFeatures();
  }, [refreshFeatures]);

  // Reset features to initial state
  const resetFeatures = useCallback((): void => {
    featureFlagsService.resetFeatures();
    refreshFeatures();
  }, [refreshFeatures]);

  // Get features by phase
  const getFeaturesByPhase = useCallback((phase: ReleasePhase): Feature[] => {
    return Object.values(features).filter(feature => feature.releasePhase === phase);
  }, [features]);

  useEffect(() => {
    // Ensure we have latest state
    refreshFeatures();
  }, [refreshFeatures]);

  return {
    features,
    isEnabled,
    enableFeature,
    disableFeature,
    toggleFeature,
    enableFeaturesByPhase,
    resetFeatures,
    getFeaturesByPhase
  };
}; 