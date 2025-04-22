import React, { useEffect } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { 
  theme, 
  VERSION,
  APP_NAME 
} from './features/common';
import { FeatureGuard, FeatureID } from './features/featureFlags';
import { featureFlagsService } from './features/featureFlags/services/featureFlagsService';
import { WorkflowExecutionManager } from './features/workflows';
import { Dashboard } from './features/dashboard';
import { Settings } from './features/settings';

// Bootstrap component to ensure features are enabled
const FeatureBootstrap: React.FC = () => {
  useEffect(() => {
    // Force enable critical features
    console.log('Bootstrapping feature flags from App component');
    featureFlagsService.enableFeature(FeatureID.WORKFLOW_TRIGGER);
    featureFlagsService.enableFeature(FeatureID.WEBHOOK_INTEGRATION);
    featureFlagsService.enableFeature(FeatureID.WORKFLOW_PARAMETERIZATION);
    
    // Debug all features status
    console.log('All features after bootstrap:', featureFlagsService.getAllFeatures());
  }, []);
  
  return null;
};

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <FeatureBootstrap />
      <Router>
        <Switch>
          <Route exact path="/">
            <Dashboard />
          </Route>
          <Route path="/executions">
            <FeatureGuard featureId={FeatureID.STATUS_MONITORING}>
              <WorkflowExecutionManager />
            </FeatureGuard>
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  );
};

export default App;
