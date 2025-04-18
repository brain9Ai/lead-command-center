# Lead Command Center

A React application for managing and executing n8n workflows focused on lead generation, qualification, enrichment, and AI-powered personalization.

![Lead Command Center Dashboard](docs/dashboard-screenshot.png)

## ✨ Features

- **Seamless n8n Integration**: Execute workflows directly from a user-friendly interface
- **Categorized Workflows**: Organized by business function (lead generation, qualification, etc.)
- **Real-time Status Updates**: Track workflow execution progress via webhooks
- **Execution History**: View past workflow runs with results and timestamps
- **Parameter Management**: Dynamic form generation based on workflow requirements
- **Feature Flag System**: Enable/disable features based on configuration
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Table of Contents

- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Usage](#-usage)
- [Architecture](#%EF%B8%8F-architecture)
- [n8n Integration](#-n8n-integration)
- [Development Guide](#%EF%B8%8F-development-guide)
- [Testing](#-testing)
- [Business Context](#-business-context)
- [Future Improvements](#-future-improvements)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Contact](#-contact)

## 🚀 Installation

### Prerequisites

- Node.js (v14+)
- npm (v6+)
- n8n instance (cloud or self-hosted)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/lead-command-center.git
   cd lead-command-center
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your n8n instance URL:
   ```
   REACT_APP_N8N_URL=https://your-n8n-instance.com
   REACT_APP_API_KEY=your-api-key-if-needed
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## ⚙️ Configuration

### API Configuration

The n8n connection is configured in `src/config/apiConfig.ts`:

```typescript
export const apiConfig = {
  n8nBaseUrl: process.env.REACT_APP_N8N_URL || 'https://n8n-cloud.example.com',
  webhookPaths: {
    triggerWorkflow: '/webhook/',
    callback: '/webhook-callback/',
    statusUpdate: '/status-update/',
  },
  polling: {
    enabled: true,
    intervalMs: 3000,
  },
  // Other API configuration options
};
```

### Workflow Mappings

Workflow names are mapped to webhook IDs in `src/config/apiConfig.ts`:

```typescript
export const workflowWebhookMap: Record<string, string> = {
  'LinkedIn Profile Enricher': 'linkedin-profile-enricher',
  'Company Website Analyzer': 'company-website-analyzer',
  'Sales Navigator Scraper': 'sales-navigator-scraper',
  // Add new workflows here
};
```

### Feature Flags

Feature flags are configured in `src/features/featureFlags/config/featureFlags.ts`:

```typescript
export const featureFlags: FeatureFlagsConfig = {
  enablePolling: true,
  enableWebhookCallbacks: true,
  enableBatchExecution: false,
  showRefreshButton: true,
  // Add new feature flags here
};
```

## 🎮 Usage

### Dashboard

The dashboard displays all available workflows organized by category:

1. Navigate to the dashboard at the root URL `/`
2. Browse workflows by category using the tabs
3. Click on a workflow card to expand and view parameters
4. Fill in required parameters and click "Execute"
5. View execution status and results in real-time

### Executing Workflows

#### Single Workflow Execution

```typescript
// Example from useWorkflowExecution.ts
const executeWorkflow = async (
  id: string, 
  name: string, 
  category: WorkflowCategory,
  parameters: Record<string, any> = {}
) => {
  try {
    setExecuting(true);
    const result = await executeSpecializedWorkflow(name, category, parameters);
    
    if (result.success) {
      addExecution({
        id: result.executionId,
        workflowId: id,
        workflowName: name,
        status: 'running',
        parameters,
        startTime: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: `Workflow "${name}" started successfully` });
    } else {
      setMessage({ type: 'error', text: result.message || `Failed to start workflow "${name}"` });
    }
    return result;
  } catch (error) {
    setMessage({ type: 'error', text: `Error: ${error.message}` });
    return { success: false, executionId: '', message: error.message };
  } finally {
    setExecuting(false);
  }
};
```

#### Batch Execution

To execute all workflows in a category:

1. Navigate to the category tab
2. Click the "Execute All" button
3. Fill in required parameters for all workflows
4. Click "Start Execution"

## 🏗️ Architecture

### High-Level Structure

The application follows a feature-based architecture:

```
src/
├── components/         # Shared UI components
├── config/             # Global configuration
├── features/           # Feature modules
│   ├── dashboard/      # Dashboard feature
│   ├── settings/       # Settings feature
│   ├── workflows/      # Workflow management
│   └── featureFlags/   # Feature flag system
├── hooks/              # Shared hooks
├── services/           # API services
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

### Feature Modules

Each feature module contains:

- `components/`: UI components specific to the feature
- `hooks/`: Custom hooks for feature logic
- `services/`: API services for the feature
- `types/`: TypeScript definitions
- `utils/`: Utility functions
- `index.ts`: Public API of the feature

### Key Components

- `Dashboard`: Main container component for workflow categories
- `WorkflowCard`: Displays workflow information and parameter inputs
- `WorkflowExecutionManager`: Tracks and displays execution status

### State Management

- **Local State**: React's useState for component-level state
- **Global State**: Context API for shared state
- **Persistence**: LocalStorage for execution history

## 🔄 n8n Integration

### Setting Up n8n

1. **Deploy n8n**:
   - Cloud: Sign up at [n8n.io](https://n8n.io)
   - Self-hosted: Follow [n8n documentation](https://docs.n8n.io/hosting/)

2. **Create Workflows**:
   - Build workflows in n8n for each business process
   - Add webhook triggers as entry points
   - Set descriptive workflow names

3. **Configure Webhooks**:
   - Each workflow should have a webhook trigger node
   - Note the webhook URLs for each workflow
   - Update the webhookMap in `apiConfig.ts`

### Webhook Integration

The application communicates with n8n using webhooks:

```typescript
// workflowApi.ts
export const workflowApi = {
  // Trigger a workflow by its webhook ID
  triggerWorkflow: async (
    webhookId: string, 
    params: Record<string, any>
  ): Promise<{
    executionId: string;
    success: boolean;
    message?: string;
  }> => {
    const url = `${apiConfig.n8nBaseUrl}${apiConfig.webhookPaths.triggerWorkflow}${webhookId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          callbackUrl: `${window.location.origin}${apiConfig.webhookPaths.callback}`,
        }),
      });
      
      const data = await response.json();
      
      return {
        executionId: data.executionId || String(Date.now()),
        success: response.ok,
        message: data.message,
      };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return {
        executionId: '',
        success: false,
        message: error.message,
      };
    }
  },
  
  // Check execution status
  checkExecutionStatus: async (executionId: string): Promise<{
    status: ExecutionStatus;
    result?: any;
  }> => {
    const url = `${apiConfig.n8nBaseUrl}/api/v1/executions/${executionId}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'X-API-KEY': apiConfig.apiKey },
      });
      
      if (!response.ok) {
        return { status: 'unknown' };
      }
      
      const data = await response.json();
      return {
        status: data.status === 'success' ? 'completed' : 
               data.status === 'failed' ? 'failed' : 'running',
        result: data.data,
      };
    } catch (error) {
      console.error('Error checking execution status:', error);
      return { status: 'unknown' };
    }
  },
};
```

### Execution Status Tracking

The application uses two methods to track execution status:

1. **Webhook Callbacks**: n8n sends execution updates to a callback URL
2. **Polling**: Regular API calls to check execution status

```typescript
// useWorkflowExecution.ts
const setupEventSource = () => {
  if (!apiConfig.eventSource.enabled) return;

  const eventSource = new EventSource(
    `${apiConfig.n8nBaseUrl}${apiConfig.eventSource.path}`
  );
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateExecutionStatus(data.executionId, data.status, data.result);
  };
  
  return () => eventSource.close();
};

const startPolling = () => {
  if (!apiConfig.polling.enabled) return;
  
  const interval = setInterval(async () => {
    const running = executions.filter(e => e.status === 'running');
    
    for (const execution of running) {
      const status = await workflowApi.checkExecutionStatus(execution.id);
      if (status.status !== 'running') {
        updateExecutionStatus(execution.id, status.status, status.result);
      }
    }
  }, apiConfig.polling.intervalMs);
  
  return () => clearInterval(interval);
};
```

## 🔌 Detailed Integration Guide

### Setting Up API Keys

1. **Obtain n8n API Key**:
   - Go to your n8n instance
   - Navigate to Settings > API Keys
   - Create a new API Key or use an existing one
   - Copy the JWT token (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

2. **Configure in the Application**:
   - In the Lead Command Center, go to Settings > API & Webhook Settings
   - Enter your n8n Base URL (e.g., `https://brain9.app.n8n.cloud`)
   - Paste your API Key in the API Key field
   - Set other configuration options like polling interval
   - Click "Save Settings"

3. **Test the Connection**:
   - **Important:** Enable a CORS extension in your browser first (see [CORS Settings](#cors-settings))
   - Click "Test n8n Connection" to verify connectivity

### Adding Webhook IDs to Workflows

1. **Finding a Workflow's Webhook ID in n8n**:
   - In n8n, open your workflow
   - Look for the "Webhook" node (usually the first node)
   - The webhook URL will be shown in the node details
   - Extract the ID from the URL (the part after `/webhook/`)
   - Example: `https://brain9.app.n8n.cloud/webhook/e697d609-eca3-4822-8037-65a4eac1704f`
   - The webhook ID is: `e697d609-eca3-4822-8037-65a4eac1704f`

2. **Update the Webhook Mapping in `src/config/apiConfig.ts`**:
   ```javascript
   export const workflowWebhookMap: Record<string, string> = {
     'LinkedIn Post Enricher': 'e697d609-eca3-4822-8037-65a4eac1704f',
     'Company Website Analyzer': '7fa8c625-bdf3-4437-92c1-2eed7aa13170',
     // Add your new workflow here with its webhook ID
     'New Workflow Name': 'paste-webhook-id-here',
   };
   ```

3. **Adding a New Workflow to `src/data/mockData.ts`**:
   ```javascript
   const aiPersonalizationWorkflows: Workflow[] = [
     // Existing workflows...
     {
       id: uuidv4(),
       name: "New AI Workflow",
       description: "Description of what this workflow does.",
       category: "AI Personalization", // Use existing category
       webhookUrl: "/webhook/paste-webhook-id-here",
       parameters: [
         {
           name: "inputParam1",
           label: "Input Parameter 1",
           type: "string",
           required: true,
           placeholder: "Enter parameter 1"
         },
         {
           name: "inputParam2",
           label: "Input Parameter 2",
           type: "number",
           required: false,
           defaultValue: 5
         }
       ]
     }
   ];
   ```

4. **Update Export in `mockData.ts`**:
   Ensure your new workflow is included in the category array and exported:
   ```javascript
   export const workflowsData: Workflow[] = [
     ...leadGenerationWorkflows,
     ...leadQualificationWorkflows,
     ...leadEnrichmentWorkflows,
     ...aiPersonalizationWorkflows, // Make sure this includes your new workflow
     ...repliesFollowUpsWorkflows,
   ];
   ```

### Feature Flags Configuration

The application uses feature flags to enable/disable specific functionality. These are defined in `src/features/featureFlags/index.ts`:

```javascript
// Available feature IDs
export enum FeatureID {
  WORKFLOW_TRIGGER = 'workflow-trigger',
  STATUS_MONITORING = 'status-monitoring',
  WEBHOOK_INTEGRATION = 'webhook-integration',
  USER_MANAGEMENT = 'user-management',
  MULTI_ACCOUNT = 'multi-account',
}
```

Feature flags are enabled in `src/index.tsx`:

```javascript
// Enable features for the application
featureFlagsService.enableFeature(FeatureID.WORKFLOW_TRIGGER);
featureFlagsService.enableFeature(FeatureID.STATUS_MONITORING);
featureFlagsService.enableFeature(FeatureID.WEBHOOK_INTEGRATION);
```

To enable or disable a feature:
```javascript
// To enable a feature
featureFlagsService.enableFeature(FeatureID.FEATURE_NAME);

// To disable a feature
featureFlagsService.disableFeature(FeatureID.FEATURE_NAME);

// To check if a feature is enabled
featureFlagsService.isFeatureEnabled(FeatureID.FEATURE_NAME);
```

### Environment Setup for Development

#### CORS Settings for Browser

Since the application makes direct API calls to n8n from the browser, you'll need to address CORS (Cross-Origin Resource Sharing) restrictions:

1. **Use a CORS Browser Extension (Recommended)**:
   - For Chrome: [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
   - For Firefox: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)
   - Install and enable the extension before making API calls

2. **Disable Web Security in Chrome (For Development Only)**:
   ```bash
   # Close all existing Chrome instances first, then:
   chrome --disable-web-security --user-data-dir="./temp"
   ```

3. **Configure n8n to Allow CORS** (if you have admin access):
   - Add your application domain to the allowed origins list in n8n
   - Consult n8n documentation for specific instructions

#### Alternative Port Configuration

If port 3000 is already in use (common when running multiple development servers), the application will prompt you to use an alternative port:

```
? Something is already running on port 3000. Probably:
  node /path/to/some/other/app (pid XXXXX)
Would you like to run the app on another port instead? › (Y/n)
```

Type `Y` to start the app on an alternative port (typically 3001).

#### Development Mode Health Checks

By default, health checks to n8n are disabled when the application starts. This is controlled in the `useWorkflowExecution.ts` file:

```javascript
// On initialization, setup event sources if polling is disabled
useEffect(() => {
  console.log('useWorkflowExecution hook initialized');
  
  // Automatic health check is disabled by default
  // testN8nConnectivity();
  
  // Rest of initialization
}, []);
```

If you want to enable automatic health checks, uncomment the `testN8nConnectivity()` line, but be aware this will cause CORS errors if you don't have a CORS extension enabled.

### Troubleshooting Integration Issues

1. **API Key Format**:
   - Ensure your API key is a valid JWT token (contains periods)
   - It should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYmE2...`

2. **Webhook URL Format**:
   - The n8n webhook URL should include the base URL, webhook path, and ID
   - Example: `https://brain9.app.n8n.cloud/webhook/e697d609-eca3-4822-8037-65a4eac1704f`

3. **CORS Integration Tests**:
   - If using a browser extension, ensure it's active before testing
   - Look for specific error messages in the browser console (F12)
   - If you see "strict-origin-when-cross-origin, cors error", activate your CORS extension

4. **Authentication Flow**:
   - The app sends the API key in two ways:
     - As a query parameter: `?apiKey=your-jwt-token`
     - As a header: `X-N8N-API-KEY: your-jwt-token`
   - This ensures compatibility with various n8n setups

## 🧪 Testing

### Unit Testing

Run unit tests with:

```bash
npm test
```

Key areas to test:
- API service functions
- Hook logic
- Parameter validation
- UI rendering

### Integration Testing

Test the integration with n8n:

1. Set up test workflows in n8n
2. Trigger them from the application
3. Verify execution flow and status updates

### End-to-End Testing

Use Cypress for E2E testing:

```bash
npm run cypress:open
```

## 💼 Business Context

The Lead Command Center supports the following business processes:

### Lead Generation

- Sales Navigator scraping for targeted prospects
- LinkedIn job posting analysis for opportunity detection
- Apollo integration for lead database access

### Lead Qualification

- Multi-step qualification process
- Scoring algorithm for lead quality assessment
- Integration with external qualification services

### Lead Enrichment

- LinkedIn profile data extraction
- Company website analysis
- Additional data points from third-party services

### AI Personalization

- Content analysis for personalization hooks
- Company messaging analysis
- LinkedIn post sentiment analysis

## 🚀 Future Improvements

- **Authentication**: Implement user authentication with JWT or OAuth
- **Cloud Sync**: Sync execution history to cloud storage for team sharing
- **Workflow Builder**: Visual interface for creating workflows without n8n UI
- **Advanced Analytics**: Dashboard for workflow execution metrics and insights
- **Batch Processing**: Enhanced UI for batch workflow execution with progress tracking
- **Webhook Management**: User interface for managing webhook configurations

## 🔍 Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify n8n URL in `.env` file
   - Check n8n instance is running and accessible
   - Ensure webhook paths are correctly configured
   - Verify network access between app and n8n

2. **Parameter Errors**:
   - Check parameter types match workflow expectations
   - Verify required parameters are provided
   - Look for case sensitivity issues in parameter names

3. **Execution Status Errors**:
   - Enable polling if webhook callbacks aren't working
   - Increase polling interval for long-running workflows
   - Check CORS settings on n8n server

### Debug Mode

Enable debug mode for detailed logging:

```
REACT_APP_DEBUG=true
```

When debug mode is enabled, the application will log:
- API requests and responses
- Webhook events
- State changes
- Error details

## 📄 License

[MIT License](LICENSE)

## 📞 Contact

For support or questions, contact [your-email@example.com](mailto:your-email@example.com) 