import { v4 as uuidv4 } from 'uuid';
import { Workflow } from '../features/workflows/types';
import { WorkflowCategory } from '../types/workflows';

// Mock workflows for development and testing
export const mockWorkflows: Workflow[] = [
  // LEAD GENERATION WORKFLOWS - 7 items
  {
    id: uuidv4(),
    name: 'Automated LinkedIn Job Scraper',
    description: 'Scrapes job posts from LinkedIn to identify companies actively hiring for target roles',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: '/webhook-test/linkedin-job-scraper',
    parameters: [
      {
        name: 'searchQuery',
        type: 'string',
        label: 'Job Title or Keyword',
        required: true,
        default: '',
        description: 'Job title or keyword to search for'
      },
      {
        name: 'location',
        type: 'string',
        label: 'Job Location',
        required: true,
        default: '',
        description: 'Job Location (e.g., city, state, country)'
      },
      {
        name: 'maxResults',
        type: 'number',
        label: 'Maximum Results',
        required: false,
        default: 50,
        description: 'Maximum number of results to return'
      },
      {
        name: 'apifyApiKey',
        type: 'apikey',
        label: 'Apify API Key',
        required: true,
        default: '',
        description: 'Your Apify API key for higher rate limits'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Apollo Lead Scrape',
    description: 'Extracts contact information using Apollo.io data source',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: '/webhook-test/apollo-lead-scrape',
    parameters: [
      {
        name: 'getEmails',
        type: 'boolean',
        label: 'Get Emails',
        required: false,
        default: false,
        description: 'Whether to include email addresses in the results'
      },
      {
        name: 'waitForEmailVerification',
        type: 'boolean',
        label: 'Wait for Email Verification',
        required: false,
        default: false,
        description: 'Whether to wait for email verification before returning results'
      },
      {
        name: 'apolloCookie',
        type: 'string',
        label: 'Apollo Cookie',
        required: true,
        default: '',
        description: 'Apollo.io cookie for authentication'
      },
      {
        name: 'apolloSearchUrl',
        type: 'string',
        label: 'Apollo Search URL',
        required: true,
        default: '',
        description: 'Apollo.io search URL to scrape leads from'
        
      },
      {
        name: 'apifyKey',
        type: 'apikey',
        label: 'Apify API Key',
        required: false,
        default: '',
        description: 'Your Apify API key for higher rate limits'
      },
      {
        name: 'maxResults',
        type: 'number',
        label: 'Maximum Results',
        required: false,
        default: 50,
        description: 'Maximum number of results to return'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Sales Navigator Lead Scraper',
    description: 'Extracts leads from LinkedIn Sales Navigator using advanced filters',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: '/webhook/sales-navigator-lead-scraper',
    parameters: [
      {
        name: 'filterCriteria',
        type: 'string',
        label: 'Filter Criteria',
        required: true,
        default: '',
        description: 'Criteria to use for filtering leads (JSON)'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Lead Generation | Name Only',
    description: 'Generates leads using only name-based search criteria',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: '/webhook/lead-generation-name-only',
    parameters: [
      {
        name: 'names',
        type: 'string',
        label: 'Names',
        required: true,
        default: '',
        description: 'Comma-separated list of names to search for'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Lead Generation | Keywords - Email',
    description: 'Generates leads using keyword search and returns email data',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: '/webhook-test/lead-generation-keywords-email',
    parameters: [
      {
        name: 'keywords',
        type: 'string',
        label: 'Keywords',
        required: true,
        default: '',
        description: 'Comma-separated list of keywords to search by'
      },
      {
        name: 'includeEmails',
        type: 'boolean',
        label: 'Include Emails',
        required: false,
        default: true,
        description: 'Whether to include email addresses in results'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Clutch Lead Generation | Decision Makers',
    description: 'Identifies decision makers in target companies',
    category: WorkflowCategory.LeadGeneration,
    webhookUrl: '/webhook/lead-generation-decision-makers-clutch',
    parameters: [
      {
        name: 'companyDomains',
        type: 'string',
        label: 'Company Domains',
        required: true,
        default: '',
        description: 'Comma-separated list of company domains to search'
      },
      {
        name: 'jobTitles',
        type: 'string',
        label: 'Job Titles',
        required: false,
        default: 'CEO,CTO,Director,VP,Head',
        description: 'Comma-separated list of job titles to filter by'
      }
    ]
  },
  
  // LEAD QUALIFICATION WORKFLOWS - 2 items
  {
    id: uuidv4(),
    name: '3-Step Lead Qualification',
    description: 'Filters leads using job title, seniority, and signal-based logic',
    category: WorkflowCategory.LeadQualification,
    webhookUrl: '/webhook/qualification/3-step',
    parameters: [
      {
        name: 'inputSource',
        type: 'string',
        label: 'Input Source',
        required: true,
        default: '',
        description: 'Source of leads to qualify (e.g., Airtable table name)'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Personalization',
    description: 'Flags qualified leads for enrichment and email generation workflows',
    category: WorkflowCategory.LeadQualification,
    webhookUrl: '/webhook/qualification/personalization-trigger',
    parameters: [
      {
        name: 'minScore',
        type: 'number',
        label: 'Minimum Score',
        required: false,
        default: 70,
        description: 'Minimum qualification score (0-100)'
      }
    ]
  },
  
  // LEAD ENRICHMENT WORKFLOWS - 5 items
  {
    id: uuidv4(),
    name: 'LinkedIn Personalization',
    description: 'Extracts personalization information from LinkedIn profiles',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: '/webhook/enrichment/linkedin-personalization',
    parameters: [
      {
        name: 'profileUrls',
        type: 'string',
        label: 'Profile URLs',
        required: true,
        default: '',
        description: 'Comma-separated list of LinkedIn profile URLs'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Scrape + Enrich',
    description: 'Triggers multi-source data enrichment from LinkedIn, Apollo, and websites',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: '/webhook/enrichment/scrape-enrich',
    parameters: [
      {
        name: 'leadIds',
        type: 'string',
        label: 'Lead IDs',
        required: true,
        default: '',
        description: 'Comma-separated list of lead IDs to enrich'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Linkedin',
    description: 'Fetches job history, summary, and personal insights from LinkedIn profiles',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: '/webhook/enrichment/linkedin-profile',
    parameters: [
      {
        name: 'profileUrls',
        type: 'string',
        label: 'Profile URLs',
        required: true,
        default: '',
        description: 'Comma-separated list of LinkedIn profile URLs'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Enrichment | Website Sections',
    description: 'Extracts specific sections from company websites for lead enrichment',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: '/webhook/enrichment/website-sections',
    parameters: [
      {
        name: 'domainName',
        type: 'string',
        label: 'Domain Name',
        required: true,
        default: '',
        description: 'Company domain name to analyze'
      },
      {
        name: 'sections',
        type: 'string',
        label: 'Sections',
        required: false,
        default: 'about,team,contact',
        description: 'Comma-separated list of sections to extract'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Company Website | Smart Crawler',
    description: 'Intelligently crawls company websites to identify key information',
    category: WorkflowCategory.LeadEnrichment,
    webhookUrl: '/webhook/enrichment/smart-crawler',
    parameters: [
      {
        name: 'domainName',
        type: 'string',
        label: 'Domain Name',
        required: true,
        default: '',
        description: 'Company domain name to analyze'
      },
      {
        name: 'maxPages',
        type: 'number',
        label: 'Max Pages',
        required: false,
        default: 10,
        description: 'Maximum number of pages to crawl'
      }
    ]
  },
  
  // AI PERSONALIZATION WORKFLOWS - 4 items
  {
    id: uuidv4(),
    name: 'LinkedIn Post | Personal + Company',
    description: 'Analyzes LinkedIn posts from both personal profiles and company pages',
    category: WorkflowCategory.AIPersonalization,
    webhookUrl: '/webhook/personalization/linkedin-post',
    parameters: [
      {
        name: 'profileUrl',
        type: 'string',
        label: 'LinkedIn Profile URL',
        required: true,
        default: '',
        description: 'URL of the LinkedIn profile to analyze'
      },
      {
        name: 'companyUrl',
        type: 'string',
        label: 'Company URL',
        required: false,
        default: '',
        description: 'URL of the company page to analyze'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Deep Insights - About Page',
    description: 'Extracts deep insights from company About pages',
    category: WorkflowCategory.AIPersonalization,
    webhookUrl: '/webhook/personalization/about-page-insights',
    parameters: [
      {
        name: 'companyDomain',
        type: 'string',
        label: 'Company Domain',
        required: true,
        default: '',
        description: 'Domain of the company website to analyze'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'AI Personalization | Departments',
    description: 'Personalizes outreach based on departmental needs and pain points',
    category: WorkflowCategory.AIPersonalization,
    webhookUrl: '/webhook/personalization/departments',
    parameters: [
      {
        name: 'department',
        type: 'string',
        label: 'Department',
        required: true,
        default: 'sales',
        description: 'Department to personalize for (sales, marketing, hr, etc.)'
      },
      {
        name: 'companyData',
        type: 'string',
        label: 'Company Data',
        required: false,
        default: '',
        description: 'Additional company data for personalization'
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'AI Personalization | 3 Snippets',
    description: 'Generates three personalized content snippets for outreach',
    category: WorkflowCategory.AIPersonalization,
    webhookUrl: '/webhook/personalization/3-snippets',
    parameters: [
      {
        name: 'leadId',
        type: 'string',
        label: 'Lead ID',
        required: true,
        default: '',
        description: 'ID of the lead to personalize for'
      },
      {
        name: 'templateId',
        type: 'string',
        label: 'Template ID',
        required: false,
        default: '',
        description: 'Optional template ID to use as a base'
      }
    ]
  },
  
  // REPLIES & FOLLOW-UPS WORKFLOWS - 1 item
  {
    id: uuidv4(),
    name: 'AI Personalization | Departments',
    description: 'Personalizes follow-up responses based on departmental context',
    category: WorkflowCategory.RepliesAndFollowups,
    webhookUrl: '/webhook/replies/departments',
    parameters: [
      {
        name: 'department',
        type: 'string',
        label: 'Department',
        required: true,
        default: 'sales',
        description: 'Department to personalize for (sales, marketing, hr, etc.)'
      },
      {
        name: 'emailContent',
        type: 'string',
        label: 'Email Content',
        required: true,
        default: '',
        description: 'Content of the original email to respond to'
      }
    ]
  }
];

// Export the categories used for workflow filtering
export const workflowCategories: { id: WorkflowCategory; name: string; color: string }[] = [
  { id: WorkflowCategory.LeadGeneration, name: 'Lead Generation', color: 'blue.500' },
  { id: WorkflowCategory.LeadQualification, name: 'Lead Qualification', color: 'purple.500' },
  { id: WorkflowCategory.LeadEnrichment, name: 'Lead Enrichment', color: 'green.500' },
  { id: WorkflowCategory.AIPersonalization, name: 'AI Personalization', color: 'orange.500' },
  { id: WorkflowCategory.RepliesAndFollowups, name: 'Replies & Follow-ups', color: 'red.500' }
]; 