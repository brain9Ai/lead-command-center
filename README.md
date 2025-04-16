# Lead Command Center

A React application for managing and executing n8n workflows designed for lead generation, qualification, enrichment, and personalization.

## Features

- Integration with n8n workflow automation platform
- Workflow categorization and organization
- Execution tracking and status monitoring
- Customizable workflow parameters
- Real-time status updates
- Persistent execution history

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [n8n Integration Guide](#n8n-integration-guide)
- [Development Guide](#development-guide)
  - [Project Structure](#project-structure)
  - [Development Environment](#development-environment)
  - [Code Conventions](#code-conventions)
  - [State Management](#state-management)
  - [Component Development](#component-development)
  - [Typescript Types](#typescript-types)
  - [API Integration](#api-integration)
  - [Error Handling](#error-handling)
  - [Authentication](#authentication)
  - [Environment Variables](#environment-variables)
  - [Build Process](#build-process)
  - [Debugging](#debugging)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Business Details](#business-details)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)
- [FAQs](#faqs)

## Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- n8n instance (cloud or self-hosted)
- Git
- VS Code (recommended) with the following extensions:
  - ESLint
  - Prettier
  - React Developer Tools
  - TypeScript Hero

### Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd lead-command-center
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your n8n instance URL and other required settings.

5. Start the development server:
   ```bash
   npm start
   ```

## Configuration

The application can be configured by editing the following files:

- `src/config/apiConfig.ts` - n8n API connection settings
- `src/config/index.ts` - General application configuration
- `src/mockData.ts` - Mock workflow definitions for development

### n8n Configuration

Update the `apiConfig.ts` file with your n8n instance details:

```typescript
export const apiConfig: ApiConfig = {
  n8nBaseUrl: 'https://your-n8n-instance.com',
  webhooks: {
    triggerWebhook: '/webhook/trigger',
    callbackEndpoint: 'https://your-app.example.com/api/webhook-callback',
    statusUpdatePath: '/api/workflow-status-update',
  },
  polling: {
    enabled: true,                 // Enable/disable polling
    interval: 30000,               // 30 seconds
  },
};
```

### Available Environment Variables

Configure the following variables in your `.env` file:

```
REACT_APP_N8N_BASE_URL=https://your-n8n-instance.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
REACT_APP_WEBHOOK_BASE_PATH=/webhook
REACT_APP_ENABLE_POLLING=true
REACT_APP_POLLING_INTERVAL=30000
```

## Usage

After starting the application, navigate to the dashboard to view and execute workflows:

1. **Browse Workflows**: View workflows organized by category
2. **Workflow Details**: Click on a workflow to view details and parameters
3. **Execute Workflows**: Provide parameters and execute individual workflows
4. **Monitor Executions**: Track the status of executed workflows in real-time
5. **View History**: Browse execution history with timestamps and results

## Architecture

The application follows a feature-based modular architecture:

```
src/
├── components/        # Shared UI components
├── config/            # Application configuration
├── features/          # Feature modules
│   ├── dashboard/     # Dashboard feature
│   ├── settings/      # Settings feature
│   └── workflows/     # Workflows feature
├── hooks/             # Custom React hooks
├── services/          # API and other services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

### Data Flow

The application follows this data flow pattern:

1. User interacts with UI components
2. Components call hooks (useWorkflow, useWorkflowExecution)
3. Hooks call service functions (workflowApi)
4. Services make API requests or update local state
5. UI updates based on returned data or state changes

### Communication with n8n

Communication with n8n happens through the following mechanisms:

1. **Webhook Triggers**: Sends HTTP POST requests to n8n webhook endpoints
2. **Status Polling**: Periodically checks the status of running workflows
3. **Webhook Callbacks**: Receives callbacks from n8n when workflow status changes (when configured)

## n8n Integration Guide

### Setting Up n8n Workflows

1. Create workflows in n8n with webhook triggers
2. Configure webhook nodes in n8n to provide status updates back to the application
3. Add appropriate parameters to your workflow
4. Test the workflow execution through n8n's interface

### n8n Integration Implementation

Below is a detailed guide on implementing the n8n integration in the application:

#### 1. Connection Configuration

First, configure the n8n connection in `src/config/apiConfig.ts`:

```typescript
// src/config/apiConfig.ts
export interface ApiConfig {
  n8nBaseUrl: string;
  webhooks: {
    triggerWebhook: string;
    callbackEndpoint: string;
    statusUpdatePath: string;
  };
  polling: {
    enabled: boolean;
    interval: number;
  };
}

export const apiConfig: ApiConfig = {
  n8nBaseUrl: process.env.REACT_APP_N8N_BASE_URL || 'https://n8n-cloud.example.com',
  webhooks: {
    triggerWebhook: '/webhook',
    callbackEndpoint: 'https://your-app.example.com/api/webhook-callback',
    statusUpdatePath: '/api/workflow-status-update',
  },
  polling: {
    enabled: process.env.REACT_APP_ENABLE_POLLING !== 'false',
    interval: parseInt(process.env.REACT_APP_POLLING_INTERVAL || '30000', 10),
  },
};
```

#### 2. Workflow API Service

Create a service to handle API communication with n8n:

```typescript
// src/services/api/workflowApi.ts
import { apiConfig } from '../../config/apiConfig';
import { v4 as uuidv4 } from 'uuid';

interface TriggerWorkflowParams {
  workflowId: string;
  webhookPath: string;
  parameters: Record<string, any>;
  executionId?: string;
}

interface WorkflowExecutionResult {
  success: boolean;
  executionId: string;
  message?: string;
  error?: string;
}

export const workflowApi = {
  /**
   * Trigger a workflow in n8n via webhook
   */
  async triggerWorkflow(
    { workflowId, webhookPath, parameters, executionId = uuidv4() }: TriggerWorkflowParams
  ): Promise<WorkflowExecutionResult> {
    try {
      const webhookUrl = `${apiConfig.n8nBaseUrl}${webhookPath}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          executionId,
          workflowId,
          parameters,
          callbackUrl: apiConfig.webhooks.callbackEndpoint,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        executionId,
        message: 'Workflow execution started successfully',
      };
    } catch (error) {
      console.error('Error triggering workflow:', error);
      return {
        success: false,
        executionId,
        message: 'Failed to trigger workflow',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Check the status of a workflow execution
   */
  async checkExecutionStatus(executionId: string): Promise<any> {
    try {
      const response = await fetch(
        `${apiConfig.n8nBaseUrl}/api/executions/${executionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking execution status:', error);
      throw error;
    }
  },
};
```

#### 3. Webhook Handling in n8n

In n8n, set up a workflow with a webhook trigger:

1. Create a new workflow
2. Add a "Webhook" trigger node
3. Configure it to receive POST requests
4. Set up the node to parse JSON input
5. Connect it to your processing nodes

Example n8n webhook configuration:
- **Authentication**: None (or Basic Auth if required)
- **HTTP Method**: POST
- **Path**: /linkedin-scraper (this will be part of the webhook URL)
- **Response Mode**: Last Node

#### 4. Workflow Execution Hook

Create a custom hook to manage workflow execution:

```typescript
// src/features/workflows/hooks/useWorkflowExecution.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { workflowApi } from '../../../services/api/workflowApi';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { apiConfig } from '../../../config/apiConfig';
import { Workflow, WorkflowExecution, WorkflowStatus } from '../types';

export const useWorkflowExecution = () => {
  // Store executions in local storage
  const [executions, setExecutions] = useLocalStorage<Record<string, WorkflowExecution>>(
    'workflow-executions',
    {}
  );
  
  // Track polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Execute a workflow
  const executeWorkflow = useCallback(
    async (workflow: Workflow, parameters: Record<string, any>): Promise<string | null> => {
      try {
        // Create a new execution object
        const executionId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        // Update local state with pending execution
        const newExecution: WorkflowExecution = {
          id: executionId,
          workflowId: workflow.id,
          status: WorkflowStatus.PENDING,
          startTime: now,
          parameters,
          result: null,
          error: null,
        };
        
        setExecutions(prev => ({
          ...prev,
          [executionId]: newExecution,
        }));
        
        // Trigger the workflow in n8n
        const result = await workflowApi.triggerWorkflow({
          workflowId: workflow.id,
          webhookPath: workflow.webhookUrl,
          parameters,
          executionId,
        });
        
        if (result.success) {
          // Update to running status
          setExecutions(prev => ({
            ...prev,
            [executionId]: {
              ...prev[executionId],
              status: WorkflowStatus.RUNNING,
            },
          }));
          
          // Start polling if enabled
          if (apiConfig.polling.enabled) {
            startPollingStatus(executionId);
          }
          
          return executionId;
        } else {
          // Update to failed status
          setExecutions(prev => ({
            ...prev,
            [executionId]: {
              ...prev[executionId],
              status: WorkflowStatus.FAILED,
              error: result.error || 'Unknown error',
            },
          }));
          
          return null;
        }
      } catch (error) {
        console.error('Error executing workflow:', error);
        return null;
      }
    },
    [setExecutions]
  );
  
  // Start polling for status updates
  const startPollingStatus = useCallback(
    (executionId: string) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const execution = executions[executionId];
          
          // Stop polling if execution is in a terminal state
          if (
            !execution ||
            execution.status === WorkflowStatus.COMPLETED ||
            execution.status === WorkflowStatus.FAILED ||
            execution.status === WorkflowStatus.CANCELLED
          ) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            return;
          }
          
          // Check execution status
          const statusData = await workflowApi.checkExecutionStatus(executionId);
          
          // Update execution based on status
          updateExecutionStatus(executionId, statusData);
        } catch (error) {
          console.error('Error polling workflow status:', error);
        }
      }, apiConfig.polling.interval);
    },
    [executions]
  );
  
  // Update execution status based on n8n response
  const updateExecutionStatus = useCallback(
    (executionId: string, statusData: any) => {
      setExecutions(prev => {
        const execution = prev[executionId];
        if (!execution) return prev;
        
        let status = execution.status;
        let result = execution.result;
        let error = execution.error;
        let endTime = execution.endTime;
        
        // Map n8n status to our status
        if (statusData.status === 'success') {
          status = WorkflowStatus.COMPLETED;
          result = statusData.data;
          endTime = new Date().toISOString();
        } else if (statusData.status === 'error') {
          status = WorkflowStatus.FAILED;
          error = statusData.error || 'Workflow execution failed';
          endTime = new Date().toISOString();
        } else if (statusData.status === 'running') {
          status = WorkflowStatus.RUNNING;
        }
        
        return {
          ...prev,
          [executionId]: {
            ...execution,
            status,
            result,
            error,
            endTime,
          },
        };
      });
    },
    [setExecutions]
  );
  
  // Set up event source for real-time updates
  const setupEventSource = useCallback(() => {
    const eventSource = new EventSource(`${apiConfig.n8nBaseUrl}/events`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'workflow-execution-update') {
          updateExecutionStatus(data.executionId, data);
        }
      } catch (error) {
        console.error('Error processing SSE message:', error);
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
      // Fallback to polling if SSE fails
      if (apiConfig.polling.enabled) {
        // Start polling for any running executions
        Object.entries(executions).forEach(([id, execution]) => {
          if (execution.status === WorkflowStatus.RUNNING) {
            startPollingStatus(id);
          }
        });
      }
    };
    
    return eventSource;
  }, [executions, startPollingStatus, updateExecutionStatus]);
  
  // Get recent executions
  const getRecentExecutions = useCallback(
    (count = 10): WorkflowExecution[] => {
      return Object.values(executions)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, count);
    },
    [executions]
  );
  
  // Clear executions
  const clearExecutions = useCallback(() => {
    setExecutions({});
  }, [setExecutions]);
  
  return {
    executions,
    executeWorkflow,
    getRecentExecutions,
    clearExecutions,
  };
};
```

#### 5. Using the Hook in a Component

Implement the workflow execution in a component:

```tsx
// src/features/workflows/components/WorkflowExecutor.tsx
import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Text, VStack } from '@chakra-ui/react';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { Workflow, WorkflowParameter, WorkflowStatus } from '../types';

interface WorkflowExecutorProps {
  workflow: Workflow;
}

export const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({ workflow }) => {
  const { executeWorkflow, executions } = useWorkflowExecution();
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Get current execution if available
  const currentExecution = executionId ? executions[executionId] : null;
  
  // Handle parameter change
  const handleParameterChange = (param: WorkflowParameter, value: any) => {
    setParameters(prev => ({
      ...prev,
      [param.name]: value,
    }));
  };
  
  // Handle workflow execution
  const handleExecute = async () => {
    setIsExecuting(true);
    
    try {
      const id = await executeWorkflow(workflow, parameters);
      setExecutionId(id);
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">{workflow.name}</Text>
        <Text>{workflow.description}</Text>
        
        {/* Parameter inputs */}
        {workflow.parameters?.map(param => (
          <FormControl key={param.name} isRequired={param.required}>
            <FormLabel>{param.label}</FormLabel>
            <Input
              type={param.type === 'number' ? 'number' : 'text'}
              value={parameters[param.name] || param.default || ''}
              onChange={(e) => handleParameterChange(
                param, 
                param.type === 'number' ? Number(e.target.value) : e.target.value
              )}
              placeholder={param.description}
            />
          </FormControl>
        ))}
        
        {/* Execute button */}
        <Button 
          colorScheme="blue" 
          onClick={handleExecute}
          isLoading={isExecuting}
          loadingText="Executing..."
        >
          Execute Workflow
        </Button>
        
        {/* Execution status */}
        {currentExecution && (
          <Box 
            p={4} 
            bg={
              currentExecution.status === WorkflowStatus.COMPLETED ? 'green.100' :
              currentExecution.status === WorkflowStatus.FAILED ? 'red.100' :
              'blue.100'
            } 
            borderRadius="md"
          >
            <Text fontWeight="bold">
              Status: {currentExecution.status}
            </Text>
            {currentExecution.error && (
              <Text color="red.500">{currentExecution.error}</Text>
            )}
            {currentExecution.status === WorkflowStatus.COMPLETED && (
              <Text>Completed at: {new Date(currentExecution.endTime!).toLocaleString()}</Text>
            )}
            {currentExecution.result && (
              <Box mt={2}>
                <Text fontWeight="bold">Result:</Text>
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(currentExecution.result, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};
```

#### 6. Setting Up n8n Callback Handling

To handle callbacks from n8n when a workflow completes:

```typescript
// src/services/api/webhookHandler.ts
import { WorkflowExecution, WorkflowStatus } from '../../features/workflows/types';

interface WebhookPayload {
  executionId: string;
  status: string;
  result?: any;
  error?: string;
}

export const handleWebhook = async (payload: WebhookPayload): Promise<void> => {
  // This function would be called by your API endpoint that receives n8n callbacks
  try {
    // Get execution from localStorage
    const executionsJson = localStorage.getItem('workflow-executions');
    if (!executionsJson) return;
    
    const executions: Record<string, WorkflowExecution> = JSON.parse(executionsJson);
    const execution = executions[payload.executionId];
    
    if (!execution) return;
    
    // Map status from n8n
    let status: WorkflowStatus;
    switch (payload.status) {
      case 'success':
        status = WorkflowStatus.COMPLETED;
        break;
      case 'error':
        status = WorkflowStatus.FAILED;
        break;
      case 'running':
        status = WorkflowStatus.RUNNING;
        break;
      default:
        status = WorkflowStatus.UNKNOWN;
    }
    
    // Update execution
    executions[payload.executionId] = {
      ...execution,
      status,
      result: payload.result || execution.result,
      error: payload.error || execution.error,
      endTime: status === WorkflowStatus.COMPLETED || status === WorkflowStatus.FAILED 
        ? new Date().toISOString() 
        : execution.endTime,
    };
    
    // Save back to localStorage
    localStorage.setItem('workflow-executions', JSON.stringify(executions));
    
    // Dispatch custom event for real-time updates
    const event = new CustomEvent('workflow-execution-update', {
      detail: {
        executionId: payload.executionId,
        status,
      },
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error handling webhook:', error);
  }
};
```

#### 7. n8n Workflow Example

Here's an example of how to structure an n8n workflow for the Lead Command Center:

1. **Webhook Node (Trigger)**:
   - Authentication: None (or as configured)
   - HTTP Method: POST
   - Path: /linkedin-job-scraper
   - Response Mode: Last Node

2. **Function Node (Validate Input)**:
   ```javascript
   // Input validation
   const input = $input.json;
   const requiredParams = ['searchQuery'];
   
   // Check for required parameters
   for (const param of requiredParams) {
     if (!input.parameters[param]) {
       return {
         success: false,
         error: `Missing required parameter: ${param}`
       };
     }
   }
   
   // All good, continue with validated parameters
   return {
     success: true,
     executionId: input.executionId,
     parameters: input.parameters,
     callbackUrl: input.callbackUrl
   };
   ```

3. **HTTP Request Node (Call LinkedIn API)**:
   - Method: GET
   - URL: https://api.linkedin.com/v2/jobSearch
   - Query Parameters: 
     - query: {{$node["Function"].json["parameters"]["searchQuery"]}}
     - count: {{$node["Function"].json["parameters"]["maxResults"] || 10}}

4. **Function Node (Process Results)**:
   ```javascript
   // Process LinkedIn API results
   const results = $input.json;
   const executionId = $node["Function"].json.executionId;
   const callbackUrl = $node["Function"].json.callbackUrl;
   
   // Transform results
   const jobs = results.elements.map(job => ({
     id: job.entityUrn,
     title: job.title,
     company: job.companyDetails.companyName,
     location: job.formattedLocation,
     description: job.description,
     postedTime: job.postedTime
   }));
   
   // Return processed results
   return {
     executionId,
     callbackUrl,
     jobs
   };
   ```

5. **IF Node (Handle Success/Error)**:
   - Condition: {{$node["HTTP Request"].json["success"] === true}}
   - True: Continue to Success Webhook
   - False: Go to Error Webhook

6. **Webhook Node (Success Callback)**:
   - Method: POST
   - URL: {{$node["Function1"].json["callbackUrl"]}}
   - Body:
     ```json
     {
       "executionId": "={{$node["Function1"].json["executionId"]}}",
       "status": "success",
       "result": "={{$node["Function2"].json["jobs"]}}"
     }
     ```

7. **Webhook Node (Error Callback)**:
   - Method: POST
   - URL: {{$node["Function1"].json["callbackUrl"]}}
   - Body:
     ```json
     {
       "executionId": "={{$node["Function1"].json["executionId"]}}",
       "status": "error",
       "error": "={{$node["HTTP Request"].json["error"] || 'Workflow execution failed'}}"
     }
     ```

### n8n Workflow Structure Best Practices

For optimal integration with Lead Command Center, structure your n8n workflows as follows:

1. **Start with a Webhook Trigger Node**:
   - Set to receive POST requests
   - Configure to accept JSON data with parameters matching your workflow definition

2. **Add Input Validation**:
   - Use the Function node to validate input parameters
   - Return appropriate error messages for invalid inputs

3. **Include Status Updates**:
   - Add webhook nodes that call back to the application at key points
   - Send start, progress, and completion status updates

4. **Handle Errors Gracefully**:
   - Add error handling nodes
   - Set up error notifications that report back to the application

5. **Return Structured Results**:
   - Ensure your workflow returns data in a consistent JSON format
   - Include status, results, and any error information

Example n8n workflow structure:
```
[Webhook Trigger] → [Function: Validate Inputs] → [Core Processing Nodes] → [Webhook: Status Update] → [Return Results]
                                               ↓
                                         [Error Handler] → [Webhook: Error Notification]
```

### Implementing a Webhook Server for Callbacks

For the application to receive callbacks from n8n, you can implement a simple server:

```javascript
// server/webhookServer.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Webhook endpoint to receive callbacks from n8n
app.post('/api/webhook-callback', (req, res) => {
  try {
    const payload = req.body;
    console.log('Received webhook callback:', payload);
    
    // Validate the payload
    if (!payload.executionId || !payload.status) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Broadcast the status update to connected clients via WebSockets
    // This is where you'd use Socket.io or another WebSocket library
    // to push updates to the frontend in real-time
    
    // Send success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
```

### Implementing WebSocket Updates for Real-Time Status

To provide real-time updates to the frontend, add WebSocket support to your server:

```javascript
// server/webhookServer.js (with WebSockets)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Webhook endpoint to receive callbacks from n8n
app.post('/api/webhook-callback', (req, res) => {
  try {
    const payload = req.body;
    console.log('Received webhook callback:', payload);
    
    // Validate the payload
    if (!payload.executionId || !payload.status) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Broadcast the status update to all connected clients
    io.emit('workflow-update', payload);
    
    // Send success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Webhook server with WebSockets running on port ${PORT}`);
});
```

### Connecting to WebSockets in the React Application

Add a WebSocket client to your React application:

```tsx
// src/services/websocket/websocketService.ts
import { io, Socket } from 'socket.io-client';
import { apiConfig } from '../../config/apiConfig';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  
  // Initialize the socket connection
  public init(): void {
    // Get the base URL from the callback endpoint
    const baseUrl = new URL(apiConfig.webhooks.callbackEndpoint).origin;
    
    this.socket = io(baseUrl);
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
    this.socket.on('workflow-update', (payload) => {
      this.notifyListeners('workflow-update', payload);
    });
  }
  
  // Add event listener
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  // Remove event listener
  public off(event: string, callback: Function): void {
    if (!this.listeners.has(event)) return;
    
    const index = this.listeners.get(event)!.indexOf(callback);
    if (index !== -1) {
      this.listeners.get(event)!.splice(index, 1);
    }
  }
  
  // Notify all listeners of an event
  private notifyListeners(event: string, data: any): void {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket event listener:', error);
      }
    });
  }
  
  // Clean up
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();
```

### Integrating WebSockets with the Workflow Execution Hook

Update the `useWorkflowExecution` hook to use WebSockets:

```tsx
// src/features/workflows/hooks/useWorkflowExecution.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { workflowApi } from '../../../services/api/workflowApi';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { apiConfig } from '../../../config/apiConfig';
import { websocketService } from '../../../services/websocket/websocketService';
import { Workflow, WorkflowExecution, WorkflowStatus } from '../types';

export const useWorkflowExecution = () => {
  // ... existing code ...
  
  // Set up WebSocket connection
  useEffect(() => {
    // Initialize WebSocket service
    websocketService.init();
    
    // Listen for workflow updates
    const handleWorkflowUpdate = (payload: any) => {
      if (payload.executionId && executions[payload.executionId]) {
        updateExecutionStatus(payload.executionId, {
          status: payload.status,
          data: payload.result,
          error: payload.error
        });
      }
    };
    
    // Register listener
    websocketService.on('workflow-update', handleWorkflowUpdate);
    
    // Clean up
    return () => {
      websocketService.off('workflow-update', handleWorkflowUpdate);
      
      // Only disconnect if we're unmounting the main component that uses this hook
      // This could be determined by a prop or context value
      if (shouldDisconnectOnUnmount) {
        websocketService.disconnect();
      }
    };
  }, [executions, updateExecutionStatus]);
  
  // ... existing code ...
};
```

### Testing n8n Integration

To test the complete integration between your application and n8n:

1. **Start your React application**:
   ```bash
   npm start
   ```

2. **Start the webhook server**:
   ```bash
   node server/webhookServer.js
   ```

3. **Ensure n8n is running** and accessible from your application

4. **Execute a workflow** from the application UI

5. **Monitor the process**:
   - Check the browser console for API requests and WebSocket messages
   - Monitor the webhook server logs for incoming callbacks
   - Verify that the workflow status updates correctly in the UI

### Troubleshooting n8n Integration

Common issues and solutions:

#### CORS Issues with n8n

**Problem**: API calls to n8n fail due to CORS errors  
**Solution**: 
```bash
# Configure n8n to allow cross-origin requests
n8n start --cors
```

Or update your n8n configuration file to include:
```json
{
  "endpoints": {
    "rest": {
      "cors": {
        "enabled": true,
        "origin": "*"
      }
    }
  }
}
```

#### Webhook Callbacks Not Being Received

**Problem**: n8n executes but callbacks don't reach your application  
**Solution**:
1. Ensure your webhook server is publicly accessible (or use a tunnel like ngrok)
2. Verify the callback URL in `apiConfig.ts` matches your server
3. Check n8n workflow for correctly configured webhook nodes
4. Inspect network logs in n8n to see if webhook requests are being made

#### Workflow Execution Timeouts

**Problem**: Long-running workflows seem to disconnect  
**Solution**:
1. Increase the timeout in your API configuration
2. Implement a more robust polling mechanism
3. Add intermediate status updates in your n8n workflow
4. For very long workflows, consider using a queue-based architecture

### Example: Complete n8n Workflow for Lead Enrichment

Here's a complete n8n workflow example for a "LinkedIn Profile Enricher" that scrapes profile data:

```javascript
// Input Validation Function Node
const input = $input.json;
const { parameters, executionId, callbackUrl } = input;

// Validate required parameters
if (!parameters.profileUrl) {
  return {
    executionId,
    callbackUrl,
    success: false,
    error: "Missing required parameter: profileUrl"
  };
}

// Send initial status update
$node.context.callbackUrl = callbackUrl;
$node.context.executionId = executionId;

// Return validated input
return {
  executionId,
  callbackUrl,
  profileUrl: parameters.profileUrl,
  includeConnections: parameters.includeConnections === true,
  maxConnections: parameters.maxConnections || 50,
  success: true
};

// Processing Function Node
const profileData = $input.json;
const executionId = $node.context.executionId;
const callbackUrl = $node.context.callbackUrl;

// Process profile data
const enrichedProfile = {
  name: profileData.name,
  title: profileData.headline,
  company: profileData.company?.name,
  location: profileData.location,
  summary: profileData.summary,
  experience: profileData.experience?.map(job => ({
    title: job.title,
    company: job.company,
    dateRange: job.dateRange,
    description: job.description
  })),
  education: profileData.education?.map(edu => ({
    school: edu.school,
    degree: edu.degree,
    field: edu.fieldOfStudy,
    dateRange: edu.dateRange
  })),
  skills: profileData.skills?.map(skill => skill.name),
  connections: profileData.connections?.slice(0, $input.json.maxConnections)
};

// Return processed data
return {
  executionId,
  callbackUrl,
  profileData: enrichedProfile,
  success: true
};

// Success Callback Webhook Node
{
  "executionId": "={{$node.context.executionId}}",
  "status": "success",
  "result": "={{$json.profileData}}"
}

// Error Callback Webhook Node
{
  "executionId": "={{$node.context.executionId}}",
  "status": "error",
  "error": "={{$json.error || 'Unknown error occurred'}}"
}
```

This workflow:
1. Validates the input profile URL
2. Makes HTTP requests to get profile data (not shown in the example)
3. Processes the data into a clean, structured format
4. Sends success/error callbacks to the application

### Webhook States

Workflows have the following states:

- `idle`: Initial state before execution
- `pending`: Execution request has been sent
- `running`: Workflow is currently executing
- `completed`: Workflow completed successfully
- `failed`: Workflow execution failed
- `cancelled`: Workflow execution was cancelled
- `unknown`: Could not determine workflow status

## Development Guide

### Project Structure

The application is organized by features:

- `features/dashboard`: Dashboard UI and components
- `features/workflows`: Workflow management and execution
- `features/settings`: Application settings and configuration

#### Key Files and Directories

```
src/
├── App.tsx                   # Main application component
├── index.tsx                 # Application entry point
├── components/               # Shared UI components
│   ├── Button/
│   ├── Card/
│   ├── Header/
│   └── Sidebar/
├── config/                   # Configuration
│   ├── apiConfig.ts          # API configuration
│   └── index.ts              # General configuration
├── features/                 # Feature modules
│   ├── dashboard/
│   │   ├── components/       # Dashboard-specific components
│   │   │   ├── Dashboard.tsx # Main dashboard component
│   │   │   └── ...
│   │   └── index.ts          # Feature exports
│   ├── workflows/
│   │   ├── components/       # Workflow components
│   │   ├── hooks/            # Workflow-specific hooks
│   │   │   ├── useWorkflowExecution.ts
│   │   │   └── ...
│   │   ├── services/         # Workflow services
│   │   │   ├── workflowApiService.ts
│   │   │   └── workflowExecutionStore.ts
│   │   ├── types/            # Workflow type definitions
│   │   │   └── index.ts
│   │   └── index.ts          # Feature exports
│   └── settings/
│       └── ...
├── hooks/                    # Shared hooks
│   ├── useLocalStorage.ts
│   └── ...
├── services/                 # Shared services
│   ├── api/
│   │   ├── workflowApi.ts
│   │   └── ...
│   └── ...
├── types/                    # Shared type definitions
│   ├── workflows.ts
│   └── ...
└── utils/                    # Utility functions
    ├── dateFormatter.ts
    └── ...
```

### Development Environment

#### Setup VS Code

For optimal development experience, configure VS Code:

1. Install recommended extensions
2. Add this to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

#### Running Dev Server

Start the development server with:

```bash
# Standard development server
npm start

# Start with mock API (no n8n connection required)
npm run start:mock
```

#### Environment Switching

Switch between environments by editing your `.env` file or passing parameters:

```bash
# Development with mock data
REACT_APP_ENV=development npm start

# Production mode locally
REACT_APP_ENV=production npm start
```

### Code Conventions

#### React Components

- Use functional components with hooks
- Follow the component structure:
  1. Props interface
  2. Component declaration
  3. Hooks and state
  4. Helper functions
  5. Effects
  6. Return JSX

Example:

```tsx
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // State hooks
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom hooks
  const { data } = useMyCustomHook();
  
  // Helper functions
  const handleClick = () => {
    setIsLoading(true);
    onAction();
    setIsLoading(false);
  };
  
  // Effects
  useEffect(() => {
    // Effect code
    return () => {
      // Cleanup
    };
  }, []);
  
  // JSX
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click Me'}
      </button>
    </div>
  );
};
```

#### TypeScript

- Always define interfaces for component props
- Use type inference where possible
- Define explicit return types for functions
- Use union types for variables that can have different types

#### Code Style

- Use async/await for asynchronous operations
- Prefer destructuring for props and state
- Use early returns to reduce nesting
- Avoid inline styles, use Chakra UI's style props

### State Management

The application uses a combination of:

- **React Context**: For global state (see `src/context`)
- **Local Component State**: For UI-specific state
- **Custom Hooks**: For shared state logic
- **LocalStorage**: For persisting execution history

#### Workflow Execution State

Workflow execution state is managed through:

1. `useWorkflowExecution` hook: Manages execution lifecycle
2. Local storage: Persists execution history
3. Real-time updates: Via SSE or polling

### Component Development

#### Component Architecture

Components follow this hierarchy:

1. **Page Components**: Top-level containers (Dashboard, Settings)
2. **Feature Components**: Components specific to a feature (WorkflowCard)
3. **UI Components**: Generic, reusable UI elements (Button, Card)

#### Styling with Chakra UI

- Use Chakra UI's component props for styling
- Create consistent styling with theme tokens
- Responsive design using Chakra's responsive array syntax

Example:
```tsx
<Box 
  p={[2, 4, 6]} 
  bg="gray.100" 
  borderRadius="md"
  boxShadow="sm"
>
  <Text fontSize={["sm", "md", "lg"]}>Responsive Text</Text>
</Box>
```

### TypeScript Types

#### Key Type Definitions

The application uses several important TypeScript interfaces:

```typescript
// Workflow definition (src/features/workflows/types/index.ts)
export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  webhookUrl: string;
  parameters?: WorkflowParameter[];
}

// Workflow parameter
export interface WorkflowParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  label: string;
  required: boolean;
  default: any;
  description?: string;
}

// Workflow execution
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: WorkflowStatus;
  startTime: string;
  endTime?: string;
  parameters: Record<string, any>;
  result: any;
  error: string | null;
}
```

### API Integration

#### Core API Services

The application uses these key services for API integration:

1. **workflowApi.ts**: Core API functions for workflow operations
2. **workflowApiService.ts**: Feature-specific API service for workflows
3. **workflowExecutionStore.ts**: Store for execution data

#### Making API Requests

Example of triggering a workflow:

```typescript
// In a component or custom hook
import { workflowApi } from 'src/services/api/workflowApi';

const executeMyWorkflow = async (workflowId: string, parameters: any) => {
  try {
    const result = await workflowApi.triggerWorkflow(workflowId, parameters);
    if (result.success) {
      console.log(`Workflow execution started: ${result.executionId}`);
      return result.executionId;
    } else {
      console.error(`Failed to execute workflow: ${result.message}`);
      return null;
    }
  } catch (error) {
    console.error('Error executing workflow:', error);
    return null;
  }
};
```

#### Error Handling

API requests include error handling:

```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  console.error('API request failed:', error);
  // Handle error appropriately
  throw error;
}
```

### Error Handling

The application implements error handling at multiple levels:

1. **Component Level**: Error boundaries catch rendering errors
2. **Hook Level**: Try/catch blocks handle state update errors
3. **API Level**: HTTP error handling and response validation
4. **Global Level**: Unexpected error reporting and logging

#### Error Boundary

```tsx
// src/components/ErrorBoundary.tsx
import React, { ErrorInfo, Component } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}
```

### Authentication

The application uses token-based authentication with JWT.

#### Authentication Flow

1. **Login**: User provides credentials to login endpoint
2. **Token Storage**: JWT token is stored in localStorage
3. **Token Usage**: Token is included in Authorization header for API requests
4. **Token Refresh**: Auto-refresh before token expiration
5. **Logout**: Removes token and redirects to login page

### Environment Variables

Configure the following variables in your `.env` file:

```
REACT_APP_N8N_BASE_URL=https://your-n8n-instance.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
REACT_APP_WEBHOOK_BASE_PATH=/webhook
REACT_APP_ENABLE_POLLING=true
REACT_APP_POLLING_INTERVAL=30000
```

### Build Process

The build process uses Create React App's standard configuration:

```bash
# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

The production build is optimized with:
- Code splitting
- Asset optimization
- Tree shaking
- Minification

### Debugging

#### Browser DevTools

Use React DevTools and network panel to debug:
- Component state and props
- Network requests
- Redux state (via Redux DevTools)
- Console logs

#### Debug Logging

The application uses a centralized logging system:

```typescript
import { logger } from 'src/utils/logger';

// Log levels
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message', error);
```

#### Common Issues

1. **n8n Connection Issues**:
   - Check n8n is running and accessible
   - Verify URL in apiConfig.ts
   - Check CORS settings on n8n server

2. **Workflow Execution Failures**:
   - Check webhook URL is correct
   - Verify parameters match n8n requirements
   - Look for errors in browser console

## Running Locally

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Adding New Workflows

1. Create the workflow in n8n
2. Add the workflow definition to `src/mockData.ts`:

```typescript
{
  id: uuidv4(),
  name: 'My New Workflow',
  description: 'Description of what the workflow does',
  category: WorkflowCategory.LeadGeneration,
  webhookUrl: '/webhook/path-to-workflow',
  parameters: [
    {
      name: 'paramName',
      type: 'string',
      label: 'Parameter Label',
      required: true,
      default: '',
      description: 'Description of the parameter'
    }
  ]
}
```

### Feature Modules

Each feature is organized as a module with the following structure:

```
feature/
├── components/       # React components
├── hooks/            # Feature-specific hooks
├── services/         # Feature-specific services
├── types/            # Type definitions
└── index.ts          # Feature exports
```

To add a new feature module:

1. Create a directory in `src/features/`
2. Add necessary components, hooks, services, and types
3. Export the feature through an `index.ts` file
4. Import and use the feature in the appropriate place

### Creating a New Feature Module

Example process for adding a new "Analytics" feature:

1. **Create Directory Structure**:
   ```
   mkdir -p src/features/analytics/components
   mkdir -p src/features/analytics/hooks
   mkdir -p src/features/analytics/services
   mkdir -p src/features/analytics/types
   ```

2. **Define Types**:
   ```typescript
   // src/features/analytics/types/index.ts
   export interface AnalyticsData {
     workflowId: string;
     executionCount: number;
     successRate: number;
     averageDuration: number;
   }
   
   export interface AnalyticsFilters {
     startDate?: string;
     endDate?: string;
     categories?: string[];
   }
   ```

3. **Create Service**:
   ```typescript
   // src/features/analytics/services/analyticsService.ts
   import { AnalyticsData, AnalyticsFilters } from '../types';
   
   export const analyticsService = {
     async getAnalyticsData(filters: AnalyticsFilters): Promise<AnalyticsData[]> {
       // Implement data fetching logic
       return [];
     }
   };
   ```

4. **Create Hook**:
   ```typescript
   // src/features/analytics/hooks/useAnalytics.ts
   import { useState, useCallback } from 'react';
   import { AnalyticsData, AnalyticsFilters } from '../types';
   import { analyticsService } from '../services/analyticsService';
   
   export const useAnalytics = () => {
     const [data, setData] = useState<AnalyticsData[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     
     const fetchAnalytics = useCallback(async (filters: AnalyticsFilters) => {
       setLoading(true);
       try {
         const result = await analyticsService.getAnalyticsData(filters);
         setData(result);
         setError(null);
       } catch (err) {
         setError(err instanceof Error ? err.message : 'Unknown error');
       } finally {
         setLoading(false);
       }
     }, []);
     
     return { data, loading, error, fetchAnalytics };
   };
   ```

5. **Create Components**:
   ```tsx
   // src/features/analytics/components/AnalyticsDashboard.tsx
   import React, { useEffect } from 'react';
   import { Box, Heading } from '@chakra-ui/react';
   import { useAnalytics } from '../hooks/useAnalytics';
   
   export const AnalyticsDashboard: React.FC = () => {
     const { data, loading, error, fetchAnalytics } = useAnalytics();
     
     useEffect(() => {
       fetchAnalytics({});
     }, [fetchAnalytics]);
     
     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error}</div>;
     
     return (
       <Box>
         <Heading>Workflow Analytics</Heading>
         {/* Render analytics data */}
       </Box>
     );
   };
   ```

6. **Export Feature**:
   ```typescript
   // src/features/analytics/index.ts
   export * from './components/AnalyticsDashboard';
   export * from './hooks/useAnalytics';
   export * from './types';
   ```

7. **Add to App**:
   ```tsx
   // src/App.tsx
   import { AnalyticsDashboard } from './features/analytics';
   
   // Add to routes
   <Route path="/analytics" element={<AnalyticsDashboard />} />
   ```

## Testing

### Unit Testing

```bash
# Run all tests
npm test

# Run tests for a specific feature
npm test -- --testPathPattern=features/workflows
```

#### Writing Tests

Example Jest test for a component:

```tsx
// src/features/workflows/components/__tests__/WorkflowCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowCard } from '../WorkflowCard';

describe('WorkflowCard', () => {
  const mockWorkflow = {
    id: '123',
    name: 'Test Workflow',
    description: 'A test workflow',
    category: 'Lead Generation',
    webhookUrl: '/test'
  };
  
  const mockExecute = jest.fn();
  
  it('renders workflow name and description', () => {
    render(<WorkflowCard workflow={mockWorkflow} onExecute={mockExecute} />);
    
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    expect(screen.getByText('A test workflow')).toBeInTheDocument();
  });
  
  it('calls onExecute when execute button is clicked', () => {
    render(<WorkflowCard workflow={mockWorkflow} onExecute={mockExecute} />);
    
    fireEvent.click(screen.getByText('Execute'));
    expect(mockExecute).toHaveBeenCalledWith(mockWorkflow.id);
  });
});
```

### End-to-End Testing

```bash
# Start the application and run Cypress tests
npm run test:e2e
```

#### Cypress Test Example

```javascript
// cypress/integration/workflow_execution.spec.js
describe('Workflow Execution', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.intercept('POST', '**/webhook/**', { executionId: '123', status: 'pending' }).as('executeWorkflow');
  });
  
  it('should execute a workflow successfully', () => {
    // Find and click on a workflow card
    cy.contains('LinkedIn Job Scraper').click();
    
    // Fill in parameters
    cy.get('input[name="searchQuery"]').type('Software Engineer');
    
    // Execute workflow
    cy.contains('Execute Workflow').click();
    
    // Verify API call
    cy.wait('@executeWorkflow');
    
    // Verify execution started message
    cy.contains('Workflow execution started').should('be.visible');
  });
});
```

### Testing n8n Integration

To test n8n integration locally:

1. Run n8n locally or connect to a development instance
2. Configure the application to use the local n8n instance
3. Create test workflows in n8n
4. Execute workflows from the application and verify the status updates

#### Testing with Mock APIs

For testing without a real n8n instance, use the mock API mode:

```bash
REACT_APP_USE_MOCK_API=true npm start
```

This uses mock data and simulated responses from `src/mock/api`.

## Business Details

Lead Command Center streamlines the lead generation and nurturing process through automated workflows:

### Lead Generation

- Extract leads from LinkedIn, Apollo, and other sources
- Generate leads based on specific criteria and keywords
- Scrape job posts to identify potential leads

### Lead Qualification

- Filter leads based on criteria
- Score leads to prioritize follow-up
- Validate decision makers

### Lead Enrichment

- Extract additional information from LinkedIn profiles
- Get company data from websites
- Enhance lead data for better personalization

### AI Personalization

- Generate personalized outreach content
- Analyze company information for personalization hooks
- Create tailored message snippets based on lead characteristics

### Replies & Follow-ups

- Manage responses to outreach
- Schedule follow-up actions
- Personalize follow-up messages

## Future Improvements

- **Enhanced Reporting**: Add dashboard analytics for workflow performance
- **Workflow Builder**: Visual interface for creating and editing workflows
- **Template Management**: Save and reuse parameter sets as templates
- **Multi-User Support**: Role-based access control and team collaboration
- **Integration Directory**: Expanded integrations with CRMs and other tools
- **Offline Mode**: Function with limited capabilities when offline
- **Mobile Support**: Responsive design for mobile devices
- **Notification System**: Alerts for workflow completion and errors
- **Workflow Scheduling**: Set up recurring workflow executions

## Troubleshooting

### Common Issues

#### n8n Connection Problems

**Problem**: Cannot connect to n8n instance.  
**Solution**: 
1. Verify n8n is running
2. Check the n8nBaseUrl in config
3. Ensure n8n has CORS properly configured
4. Check network tab for specific errors

#### Workflow Execution Fails

**Problem**: Workflow execution starts but fails immediately.  
**Solution**:
1. Check webhook URL is correct
2. Verify parameters match n8n requirements
3. Look at n8n execution logs for errors
4. Test the webhook directly using Postman

#### UI Rendering Issues

**Problem**: Components don't render correctly.  
**Solution**:
1. Check browser console for errors
2. Verify data is being loaded correctly
3. Ensure dependencies are installed
4. Clear browser cache

### Debugging Techniques

1. **Console Logging**: Add strategic `console.log()` statements
2. **React DevTools**: Inspect component props and state
3. **Network Panel**: Check API requests and responses
4. **Source Maps**: Enable for easier debugging

## FAQs

### Development FAQs

**Q: How do I add a new workflow category?**  
A: Update the `WorkflowCategory` enum in `src/types/workflows.ts` and add the category to the `workflowCategories` array in `src/mockData.ts`.

**Q: How do I test a workflow without n8n?**  
A: Use the mock API mode by setting `REACT_APP_USE_MOCK_API=true` in your `.env` file.

**Q: How do I add authentication to the application?**  
A: Implement an auth provider in `src/context/AuthContext.tsx` and add login/logout functionality.

### n8n Integration FAQs

**Q: Can I connect to multiple n8n instances?**  
A: The application currently supports one n8n instance. To support multiple instances, modify the `apiConfig.ts` file to include instance selection.

**Q: How do I handle large workflow results?**  
A: Implement pagination in the UI and use streaming for large result sets.

## License

[License Information]

## Contact

[Contact Information] 