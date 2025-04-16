import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { 
  theme, 
  VERSION,
  APP_NAME 
} from './features/common';
import { FeatureGuard, FeatureID } from './features/featureFlags';
import { WorkflowExecutionManager } from './features/workflows';
import { Dashboard } from './features/dashboard';
import { Settings } from './features/settings';

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Switch>
          <Route exact path="/" component={Dashboard} />
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
