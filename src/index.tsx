import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FeatureID, featureFlagsService, ReleasePhase } from './features/featureFlags';

// Initialize feature flags for the initial release
// Enable core features and user management for the first release
featureFlagsService.enableFeature(FeatureID.WORKFLOW_TRIGGER);
featureFlagsService.enableFeature(FeatureID.STATUS_MONITORING);
featureFlagsService.enableFeature(FeatureID.WEBHOOK_INTEGRATION);

// Create a root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
