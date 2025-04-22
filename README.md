# Lead Command Center

A React application for triggering n8n workflows focused on lead generation, qualification, enrichment, and AI-powered personalization.

![Lead Command Center Dashboard](docs/dashboard-screenshot.png)

## ✨ Features

- **Seamless n8n Integration**: Execute workflows directly from a user-friendly interface
- **Categorized Workflows**: Organized by business function (lead generation, qualification, etc.)
- **Immediate Response**: Get instant feedback from n8n's Respond to Webhook node
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
  apiKey: '', // Will be set from localStorage by the settings component
  webhooks: {
    triggerWebhook: '/webhook',
    callbackEndpoint: '/webhook-callback'
  }
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

### Feature Flags Configuration

The application uses feature flags to enable/disable specific functionality. These are defined in `src/features/featureFlags/index.ts`:

```javascript
// Available feature IDs
export enum FeatureID {
  WORKFLOW_TRIGGER = 'workflow-trigger',
  WEBHOOK_INTEGRATION = 'webhook-integration',
  USER_MANAGEMENT = 'user-management',
  MULTI_ACCOUNT = 'multi-account',
}
```

Feature flags are enabled in `src/index.tsx`:

```javascript
// Enable features for the application
featureFlagsService.enableFeature(FeatureID.WORKFLOW_TRIGGER);
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

## 🎮 Usage

### Dashboard

The dashboard displays all available workflows organized by category:

1. Navigate to the dashboard at the root URL `/`
2. Browse workflows by category using the tabs
3. Click on a workflow card to expand and view parameters
4. Fill in required parameters and click "Execute"
5. View the immediate response from the n8n workflow

### Executing Workflows

#### Using Webhook Nodes in n8n

The Lead Command Center is designed to trigger n8n workflows that have a Webhook node as the starting point. To get immediate feedback to the user, you should also include a "Respond to Webhook" node in your workflow:

1. Start your n8n workflow with a Webhook node
2. Configure the authentication method if needed (API Key)
3. In the "Response Mode" dropdown, select "On Received"
4. Configure the workflow logic as needed
5. Add a "Respond to Webhook" node before the workflow's main processing happens
6. Configure the "Respond to Webhook" node to return a JSON object like:
   ```json
   {
     "success": true,
     "message": "Workflow started successfully"
   }
   ```
7. Connect this node to your Webhook trigger node

This approach allows the Lead Command Center to receive an immediate response that the workflow has started, while the actual processing continues in n8n.

#### Example Workflow Implementation

```typescript
// Example from useWorkflowExecution.ts
const executeWorkflow = async (
  workflow: Workflow,
  parameters: Record<string, any> = {}
) => {
  try {
    setExecuting(true);
    // Get the webhook ID for this workflow
    const webhookId = getWebhookId(workflow.name, workflow.category);
    
    // Call the n8n webhook
    const result = await workflowApi.triggerWorkflow(webhookId, parameters);
    
    // Display the response from the Respond to Webhook node
    setMessage({ 
      type: result.success ? 'success' : 'error', 
      text: result.message || (result.success ? 
        `${workflow.name} started successfully` : 
        `Failed to start ${workflow.name}`)
    });
    
    return result;
  } catch (error) {
    setMessage({ type: 'error', text: `Error: ${error.message}` });
    return { success: false, message: error.message };
  } finally {
    setExecuting(false);
  }
};
```

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
    const url = `${apiConfig.n8nBaseUrl}${apiConfig.webhooks.triggerWebhook}${webhookId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          callbackUrl: `${window.location.origin}${apiConfig.webhooks.callbackEndpoint}`,
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

## 🔄 Simplified Workflow Integration

The Lead Command Center has been simplified to focus solely on workflow triggering without execution tracking:

### Workflow Execution Model

1. **Trigger-Only Design**:
   - The system is designed to trigger workflows via n8n webhooks and display immediate success/failure messages
   - No execution tracking or status polling is performed
   - No workflow execution history is stored in localStorage

2. **n8n Webhook Response**:
   - Each n8n workflow should include a "Respond to Webhook" node early in the workflow
   - This node should return an immediate success response to the caller
   - Example response format:
     ```json
     {
       "success": true,
       "message": "Workflow started successfully"
     }
     ```

3. **Benefits of This Approach**:
   - Simplified architecture: focus only on launching workflows
   - Reduced browser resource consumption: no polling or tracking
   - Less complex state management: no execution history to maintain
   - Better reliability: each workflow operates independently

### Implementing in n8n

1. **Workflow Structure**:
   ```
   Webhook Node → Respond to Webhook → Rest of Workflow
   ```

2. **Respond to Webhook Node Configuration**:
   - Response Code: 200
   - Response Mode: "Last Node"
   - Response Format: "JSON"
   - Response Body:
     ```json
     {
       "success": true,
       "message": "Workflow started successfully",
       "workflowName": "{{$node.Webhook.json.body.workflowName}}",
       "estimatedTime": "3-5 minutes"
     }
     ```

3. **Error Handling**:
   - Add error handling in n8n workflows to ensure proper responses
   - Use "Error Trigger" nodes where appropriate

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