import React, { useState } from 'react';
import {
  Button,
  Box,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Link,
  UnorderedList,
  ListItem,
  Code
} from '@chakra-ui/react';
import { apiConfig } from '../../../config/apiConfig';

export const TestConnection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const toast = useToast();

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setTestResult(null);
      
      // Test the n8n API connection using the health endpoint
      const baseUrl = apiConfig.n8nBaseUrl;
      
      // Start with the base URL for the health endpoint
      let testUrl = `${baseUrl}/api/v1/health`;
      
      // Add API key as a query parameter - this matches the approach working in Postman
      if (apiConfig.apiKey) {
        testUrl += `?apiKey=${apiConfig.apiKey}`;
      }
      
      // Headers for the request
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      };
      
      // Also add API key as header for maximum compatibility
      if (apiConfig.apiKey) {
        headers['X-N8N-API-KEY'] = apiConfig.apiKey;
      }
      
      console.log('Testing connection to n8n...', {
        baseUrl,
        testUrl,
        hasApiKey: !!apiConfig.apiKey,
        apiKeyStart: apiConfig.apiKey ? apiConfig.apiKey.substring(0, 10) + '...' : 'none'
      });
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers
      });
      
      // Get response data if possible
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If not JSON, use status text
        data = { message: response.statusText };
      }
      
      console.log('Test connection result:', {
        success: response.ok,
        status: response.status,
        data
      });
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Connection successful! n8n API is accessible.'
        });
      } else {
        setTestResult({
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      
      // Check if it's a CORS error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isCorsError = errorMessage.includes('CORS') || 
                          errorMessage.includes('cross-origin') || 
                          errorMessage.includes('access-control-allow-origin');
      
      setTestResult({
        success: false,
        message: isCorsError 
          ? 'CORS Error: You need to enable a CORS extension in your browser before testing'
          : `Error: ${errorMessage}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box mb={4}>
      <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="yellow.50">
        <Text fontWeight="bold" mb={2}>Important: Enable CORS Extension First</Text>
        <Text fontSize="sm">
          You must have a CORS browser extension enabled to connect directly to n8n.
        </Text>
        <UnorderedList fontSize="sm" mt={2}>
          <ListItem>
            For Chrome: Install{' '}
            <Link 
              href="https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf" 
              isExternal 
              color="blue.500"
            >
              Allow CORS: Access-Control-Allow-Origin
            </Link>
          </ListItem>
          <ListItem>
            For Firefox: Install{' '}
            <Link 
              href="https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/" 
              isExternal 
              color="blue.500"
            >
              CORS Everywhere
            </Link>
          </ListItem>
        </UnorderedList>
        <Text fontSize="sm" mt={2}>
          After installing, make sure to activate the extension before clicking the test button.
        </Text>
      </Box>
      
      <Button 
        colorScheme="blue" 
        onClick={testConnection} 
        isLoading={isLoading}
        loadingText="Testing"
        mb={4}
      >
        Test n8n Connection
      </Button>
      
      {testResult && (
        <Alert 
          status={testResult.success ? 'success' : 'error'}
          variant="subtle"
          flexDirection="column"
          alignItems="flex-start"
          borderRadius="md"
          p={4}
        >
          <AlertIcon />
          <AlertTitle mr={2}>
            {testResult.success ? 'Connection Successful' : 'Connection Failed'}
          </AlertTitle>
          <AlertDescription>
            {testResult.message}
            {!testResult.success && (
              <>
                <Text mt={2} fontSize="sm">
                  Make sure your API key is correct and that your n8n instance is accessible.
                </Text>
                <Text mt={2} fontSize="sm" fontWeight="bold">
                  To fix CORS errors:
                </Text>
                <UnorderedList fontSize="sm" mt={1}>
                  <ListItem>
                    Make sure your CORS browser extension is installed and enabled
                  </ListItem>
                  <ListItem>
                    Try reloading the page after enabling the extension
                  </ListItem>
                  <ListItem>
                    Alternatively, launch Chrome with web security disabled:
                    <Code display="block" p={1} mt={1} borderRadius="md">
                      chrome --disable-web-security --user-data-dir="./temp"
                    </Code>
                  </ListItem>
                </UnorderedList>
                
                <Text mt={3} fontSize="sm" fontWeight="bold">
                  Your current configuration:
                </Text>
                <Code display="block" p={2} mt={1} borderRadius="md" fontSize="xs" whiteSpace="pre-wrap">
                  {`URL: ${apiConfig.n8nBaseUrl}/api/v1/health
API Key: ${apiConfig.apiKey ? apiConfig.apiKey.substring(0, 10) + '...' : 'Not set'}`}
                </Code>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </Box>
  );
}; 