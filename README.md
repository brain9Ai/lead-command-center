# Lead Automation Command Center

A modern web console for triggering and monitoring n8n workflows for lead generation, qualification, enrichment, personalization, and follow-ups.

## Features

- **Workflow Trigger Interface**: Launch specific workflows on demand with simple controls
- **Basic Status Monitoring**: View current workflow execution status and history
- **Webhook Integration**: Connect to your existing systems via secure webhooks
- **Categorized Workflows**: Organized by lead generation pipeline phases
- **Parameter Configuration**: Customize workflow parameters before execution

## Technology Stack

- **React**: Frontend library for building the user interface
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Chakra UI**: Component library for modern UI elements
- **Axios**: HTTP client for API calls to n8n webhooks

## Project Structure

```
lead-command-center/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx   # Application header
│   │   ├── Layout.tsx   # Main layout component
│   │   ├── Sidebar.tsx  # Navigation sidebar
│   │   ├── WorkflowCard.tsx  # Individual workflow display
│   │   └── ExecutionHistory.tsx  # Workflow execution history
│   ├── hooks/           # Custom React hooks
│   │   └── useWorkflows.ts  # Workflow management hook
│   ├── types/           # TypeScript type definitions
│   │   └── workflows.ts  # Workflow-related types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
└── package.json         # Dependencies and scripts
```

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Connecting to n8n

The command center is designed to connect directly to n8n webhooks. Update the webhook URLs in the `useWorkflows.ts` hook to point to your n8n instance:

```typescript
// Example webhook configuration
const workflows = [
  {
    id: '1',
    name: 'LinkedIn Sales Navigator Scraper',
    webhookUrl: 'https://your-n8n-instance.com/webhook/sales-navigator',
    // ...
  }
];
```

For production use, you should configure proper webhook URLs and authentication methods.

## Future Enhancements

This is the Core Functionality version (v1.0.0). Future enhancements may include:

- **Advanced Dashboard & Monitoring**: Detailed performance metrics and real-time system status
- **Analytics & Reporting**: Comprehensive data visualization and custom reporting
- **Campaign Management**: Advanced setup and management of ongoing campaigns
- **Results Visualization**: Detailed tracking of success metrics and conversion rates
- **User Management**: Control access levels and permissions for team members

## License

This project is proprietary and confidential.

## Workflow Categories

The Lead Command Center organizes workflows into five categories based on their role in the lead generation pipeline:

1. **Lead Generation**: Workflows for scraping and collecting leads from various sources:
   - LinkedIn Job Scraper
   - Apollo Lead Scraper
   - Sales Navigator Lead Scraper
   - Decision Makers Scraper
   - Name Only Lead Generator
   - Keywords-Based Decision Makers

2. **Lead Qualification**: Workflows for filtering and qualifying leads:
   - 3-Step Lead Qualification
   - Personalization Trigger Logic

3. **Lead Enrichment**: Workflows for enriching lead data with additional information:
   - Scrape & Enrich
   - LinkedIn Profile Scraper
   - Company Website Enrichment
   - Website Sections Analyzer
   - Department Completeness Check

4. **AI Personalization**: Workflows for generating personalized content:
   - AI Personalization Generator
   - LinkedIn Post Enricher
   - Personal & Company Deep Insight

5. **Replies & Follow-ups**: Workflows for managing responses and follow-ups:
   - Inbox Management

## Configuration

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
REACT_APP_N8N_BASE_URL=http://localhost:5678
REACT_APP_ENVIRONMENT=development
```

For production, create a `.env.production` file:

```
REACT_APP_N8N_BASE_URL=https://n8n.your-domain.com
REACT_APP_ENVIRONMENT=production
```

### Webhook Configuration

Webhook URLs for each workflow are configured in `src/config/index.ts`. You can update these to match your n8n instance's webhook paths.

### Running the Application

To start the application in development mode:

```bash
npm start
```

To build for production:

```bash
npm run build
```
