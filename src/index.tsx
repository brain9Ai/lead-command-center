import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import { featureFlagsService } from './features/featureFlags/services/featureFlagsService';
import { FeatureID } from './features/featureFlags/types';
import { apiConfig } from './config/apiConfig';

// Explicitly clear any existing feature flags to ensure we start fresh
try {
  localStorage.removeItem('lead_command_center_features');
  console.log('Cleared existing feature flags from localStorage');
} catch (error) {
  console.error('Error clearing feature flags:', error);
}

// Reset features to default state and explicitly enable the ones we need
featureFlagsService.resetFeatures();

// Make sure the critical WORKFLOW_TRIGGER feature is enabled
featureFlagsService.enableFeature(FeatureID.WORKFLOW_TRIGGER);
featureFlagsService.enableFeature(FeatureID.WEBHOOK_INTEGRATION);
featureFlagsService.enableFeature(FeatureID.WORKFLOW_PARAMETERIZATION);

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
      
      if (parsedSettings.callbackEndpoint && apiConfig.webhooks) {
        apiConfig.webhooks.callbackEndpoint = parsedSettings.callbackEndpoint;
      }
    }
  } catch (error) {
    console.error('Error loading API settings:', error);
  }
};

// Load settings before rendering
loadApiSettings();

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root for React 18
const root = ReactDOM.createRoot(rootElement);

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
