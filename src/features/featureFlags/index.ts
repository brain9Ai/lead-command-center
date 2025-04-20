/**
 * Feature flags for the Lead Command Center
 * This is the main entry point for the feature flags module
 */

// Export components
export { default as FeatureGuard } from './components/FeatureGuard';

// Export types
export { FeatureID, ReleasePhase } from './types';

// Export service
export { featureFlagsService } from './services/featureFlagsService';

// Import for default export
import FeatureGuardDefault from './components/FeatureGuard';
import { featureFlagsService as featureFlagsServiceDefault } from './services/featureFlagsService';

// For backward compatibility with existing imports
export default {
  featureFlagsService: featureFlagsServiceDefault,
  FeatureGuard: FeatureGuardDefault
}; 