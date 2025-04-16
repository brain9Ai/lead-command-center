import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  FormHelperText,
  Switch,
  HStack,
  Badge,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputRightElement,
  Card,
  CardBody,
  CardHeader,
  Divider
} from '@chakra-ui/react';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import { apiConfig } from '../../../config/apiConfig';
import { createChakraIcon } from '../../../utils';

interface ApiSettings {
  n8nBaseUrl: string;
  callbackEndpoint: string;
  pollingEnabled: boolean;
  pollingInterval: number;
  lastConnectionTest: string | null;
  lastSaved?: string;
}

// Function to load settings from localStorage
const loadSettings = (): ApiSettings => {
  const savedSettings = localStorage.getItem('apiSettings');
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (e) {
      console.error('Error parsing saved settings:', e);
    }
  }
  return {
    n8nBaseUrl: apiConfig.n8nBaseUrl,
    callbackEndpoint: apiConfig.webhooks.callbackEndpoint,
    pollingEnabled: apiConfig.polling.enabled,
    pollingInterval: apiConfig.polling.interval / 1000, // Convert to seconds for display
    lastConnectionTest: null
  };
};

const ApiSettings: React.FC = () => {
  const [settings, setSettings] = useState<ApiSettings>(loadSettings);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'unknown'>('unknown');
  const toast = useToast();
  
  const SaveIcon = createChakraIcon(FiSave);
  const RefreshIcon = createChakraIcon(FiRefreshCw);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Save to localStorage
      localStorage.setItem('apiSettings', JSON.stringify({
        ...settings,
        lastSaved: new Date().toISOString()
      }));
      
      // Update global config (this would be handled differently in a real application)
      // For now, we'll just update the values we need to access elsewhere
      (apiConfig as any).n8nBaseUrl = settings.n8nBaseUrl;
      (apiConfig.webhooks as any).callbackEndpoint = settings.callbackEndpoint;
      (apiConfig.polling as any).enabled = settings.pollingEnabled;
      (apiConfig.polling as any).interval = settings.pollingInterval * 1000; // Convert seconds to ms
      
      toast({
        title: 'Settings saved',
        description: 'Your API configuration has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: 'There was a problem saving your settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Test the connection to n8n
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('unknown');
    
    try {
      // Make a simple GET request to the n8n health endpoint
      const response = await fetch(`${settings.n8nBaseUrl}/api/v1/health`);
      
      if (response.ok) {
        setConnectionStatus('success');
        setSettings((prev: ApiSettings) => ({
          ...prev,
          lastConnectionTest: new Date().toISOString()
        }));
        
        toast({
          title: 'Connection successful',
          description: 'Successfully connected to n8n',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: 'Connection failed',
          description: `Could not connect to n8n: ${response.statusText}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      setConnectionStatus('error');
      toast({
        title: 'Connection error',
        description: error.message || 'Failed to connect to n8n',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev: ApiSettings) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle number input change
  const handleNumberChange = (name: string, value: string) => {
    setSettings((prev: ApiSettings) => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };
  
  return (
    <Card>
      <CardHeader>
        <Heading size="md">API & Webhook Settings</Heading>
        <Text color="gray.500" mt={1} fontSize="sm">
          Configure your connection to n8n and webhook settings
        </Text>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="start">
            <Box width="100%">
              <Heading size="sm" mb={4}>n8n Connection</Heading>
              
              <FormControl id="n8nBaseUrl" isRequired mb={4}>
                <FormLabel>n8n Base URL</FormLabel>
                <InputGroup>
                  <Input 
                    name="n8nBaseUrl"
                    value={settings.n8nBaseUrl}
                    onChange={handleChange}
                    placeholder="https://n8n-cloud.example.com"
                  />
                  <InputRightElement width="4.5rem">
                    <Button 
                      h="1.75rem" 
                      size="sm" 
                      onClick={testConnection}
                      isLoading={isTestingConnection}
                    >
                      Test
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  The base URL of your n8n cloud environment
                </FormHelperText>
                
                {connectionStatus !== 'unknown' && (
                  <Badge 
                    colorScheme={connectionStatus === 'success' ? 'green' : 'red'}
                    mt={2}
                  >
                    {connectionStatus === 'success' ? 'Connected' : 'Connection Failed'}
                  </Badge>
                )}
              </FormControl>
              
              <FormControl id="callbackEndpoint" mb={4}>
                <FormLabel>Webhook Callback URL</FormLabel>
                <Input 
                  name="callbackEndpoint"
                  value={settings.callbackEndpoint}
                  onChange={handleChange}
                  placeholder="https://your-app.example.com/api/webhook-callback"
                />
                <FormHelperText>
                  The endpoint that will receive webhook callbacks from n8n
                </FormHelperText>
              </FormControl>
            </Box>
            
            <Divider />
            
            <Box width="100%">
              <Heading size="sm" mb={4}>Polling Settings</Heading>
              
              <FormControl id="pollingEnabled" mb={4}>
                <HStack justifyContent="space-between">
                  <Box>
                    <FormLabel mb={0}>Enable Automatic Polling</FormLabel>
                    <FormHelperText mt={0}>
                      Periodically check the status of running workflows
                    </FormHelperText>
                  </Box>
                  <Switch 
                    name="pollingEnabled"
                    isChecked={settings.pollingEnabled}
                    onChange={handleChange}
                    colorScheme="brand"
                  />
                </HStack>
              </FormControl>
              
              {settings.pollingEnabled && (
                <FormControl id="pollingInterval" mb={4}>
                  <FormLabel>Polling Interval (seconds)</FormLabel>
                  <NumberInput 
                    min={5} 
                    max={120} 
                    value={settings.pollingInterval}
                    onChange={(value) => handleNumberChange('pollingInterval', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    How often to check for workflow status updates (5-120 seconds)
                  </FormHelperText>
                </FormControl>
              )}
            </Box>
            
            <Button 
              colorScheme="brand" 
              type="submit"
              leftIcon={<SaveIcon />}
              alignSelf="flex-end"
              mt={4}
            >
              Save Settings
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
};

export default ApiSettings; 