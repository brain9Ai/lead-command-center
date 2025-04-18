import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FeatureID, featureFlagsService, ReleasePhase } from './features/featureFlags';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { apiConfig } from './config/apiConfig';

// Initialize feature flags for the initial release
// Enable core features and user management for the first release
featureFlagsService.enableFeature(FeatureID.WORKFLOW_TRIGGER);
featureFlagsService.enableFeature(FeatureID.STATUS_MONITORING);
featureFlagsService.enableFeature(FeatureID.WEBHOOK_INTEGRATION);

// Load API settings from localStorage if available
const loadApiSettings = () => {
  try {
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      
      // Update the apiConfig with saved values
      if (parsedSettings.n8nBaseUrl) {
        apiConfig.n8nBaseUrl = parsedSettings.n8nBaseUrl;
      }
      
      if (parsedSettings.apiKey) {
        apiConfig.apiKey = parsedSettings.apiKey;
        console.log('Loaded API key from localStorage (first 10 chars):', 
          parsedSettings.apiKey.substring(0, 10) + '...');
      }
      
      if (parsedSettings.callbackEndpoint) {
        apiConfig.webhooks.callbackEndpoint = parsedSettings.callbackEndpoint;
      }
      
      if (parsedSettings.pollingEnabled !== undefined) {
        apiConfig.polling.enabled = parsedSettings.pollingEnabled;
      }
      
      if (parsedSettings.pollingInterval) {
        apiConfig.polling.interval = parsedSettings.pollingInterval * 1000; // Convert to ms
      }
      
      console.log('Loaded API settings from localStorage');
    }
  } catch (error) {
    console.error('Error loading API settings:', error);
  }
};

// Load settings before rendering
loadApiSettings();

// Create a root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the app
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
