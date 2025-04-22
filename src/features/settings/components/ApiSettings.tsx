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
  Divider,
  IconButton
} from '@chakra-ui/react';
import { FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import { apiConfig } from '../../../config/apiConfig';
import { createChakraIcon } from '../../../utils';
import { TestConnection } from './TestConnection';

interface ApiSettingsState {
  n8nBaseUrl: string;
  callbackEndpoint: string;
  lastConnectionTest: string | null;
  lastSaved?: string;
  apiKey: string;
  showApiKey: boolean;
}

// Function to load settings from localStorage
const loadSettings = (): ApiSettingsState => {
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
    callbackEndpoint: apiConfig.webhooks?.callbackEndpoint || '',
    lastConnectionTest: null,
    apiKey: apiConfig.apiKey,
    showApiKey: false
  };
};

export const ApiSettings: React.FC = () => {
  const [settings, setSettings] = useState<ApiSettingsState>(loadSettings);
  const toast = useToast();
  
  const SaveIcon = createChakraIcon(FiSave);
  const EyeIcon = createChakraIcon(FiEye);
  const EyeOffIcon = createChakraIcon(FiEyeOff);
  
  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings((prev: ApiSettingsState) => ({
          ...prev,
          n8nBaseUrl: parsedSettings.n8nBaseUrl || apiConfig.n8nBaseUrl,
          callbackEndpoint: parsedSettings.callbackEndpoint || apiConfig.webhooks?.callbackEndpoint || '',
          apiKey: parsedSettings.apiKey || apiConfig.apiKey,
          showApiKey: parsedSettings.showApiKey || false
        }));
      } catch (e) {
        console.error('Error parsing saved API settings:', e);
      }
    }
  }, []);
  
  // Handle save settings
  const saveSettings = () => {
    try {
      // Validate the API key - it should look like a JWT token
      if (settings.apiKey && !settings.apiKey.includes('.')) {
        toast({
          title: "Invalid API Key",
          description: "The API key should be a JWT token (contains periods)",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return; // Don't save invalid API key
      }
      
      // Save to localStorage
      const settingsToSave = {
        n8nBaseUrl: settings.n8nBaseUrl,
        apiKey: settings.apiKey,
        callbackEndpoint: settings.callbackEndpoint,
      };
      
      localStorage.setItem('apiSettings', JSON.stringify(settingsToSave));
      
      // For now, we'll just update the values we need to access elsewhere
      (apiConfig as any).n8nBaseUrl = settings.n8nBaseUrl;
      (apiConfig as any).apiKey = settings.apiKey;
      (apiConfig.webhooks as any).callbackEndpoint = settings.callbackEndpoint;
      
      toast({
        title: "Settings saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      setSettings(prev => ({
        ...prev,
        lastSaved: new Date().toLocaleTimeString()
      }));
      
      // Log the first part of the API key for debugging (never log the full key)
      if (settings.apiKey) {
        console.log('API Key (first 10 chars):', settings.apiKey.substring(0, 10) + '...');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, checked, type } = e.target;
    
    setSettings((prevSettings: ApiSettingsState) => ({
      ...prevSettings,
      [id]: type === 'checkbox' ? checked : value
    }));
  };
  
  const toggleApiKeyVisibility = () => setSettings((prev: ApiSettingsState) => ({
    ...prev,
    showApiKey: !prev.showApiKey
  }));
  
  return (
    <Card>
      <CardHeader>
        <Heading size="md">API & Webhook Settings</Heading>
        <Text color="gray.500" mt={1} fontSize="sm">
          Configure your connection to n8n and webhook settings
        </Text>
      </CardHeader>
      
      <CardBody>
        <form onSubmit={(e) => { e.preventDefault(); saveSettings(); }}>
          <VStack spacing={6} align="stretch">
            <Heading size="sm">n8n API Connection</Heading>
            
            <FormControl id="n8nBaseUrl">
              <FormLabel>n8n Base URL</FormLabel>
              <Input 
                value={settings.n8nBaseUrl} 
                id="n8nBaseUrl"
                onChange={handleChange}
                placeholder="https://your-n8n-instance.com" 
              />
              {settings.n8nBaseUrl && !settings.n8nBaseUrl.startsWith('http') && (
                <FormHelperText color="red.500">
                  URL must start with http:// or https://
                </FormHelperText>
              )}
            </FormControl>
            
            <FormControl id="apiKey">
              <FormLabel>n8n API Key</FormLabel>
              <InputGroup>
                <Input 
                  type={settings.showApiKey ? 'text' : 'password'} 
                  value={settings.apiKey} 
                  id="apiKey"
                  onChange={handleChange}
                  placeholder="Your n8n API key"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={settings.showApiKey ? 'Hide API key' : 'Show API key'}
                    icon={settings.showApiKey ? <EyeOffIcon /> : <EyeIcon />}
                    onClick={toggleApiKeyVisibility}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText>
                Required for authenticated n8n instances. Find this in your n8n settings.
              </FormHelperText>
            </FormControl>
            
            <TestConnection />
            
            <Divider my={2} />
            
            <Heading size="sm">Webhook Settings</Heading>
            
            <FormControl id="callbackEndpoint">
              <FormLabel>Callback Endpoint</FormLabel>
              <Input 
                value={settings.callbackEndpoint} 
                id="callbackEndpoint"
                onChange={handleChange}
                placeholder="https://your-app.example.com/api/webhook-callback" 
              />
              <FormHelperText>
                The endpoint where n8n can send callbacks using the 'Respond to Webhook' node
              </FormHelperText>
            </FormControl>
            
            <Button 
              mt={4} 
              colorScheme="blue" 
              type="submit"
              leftIcon={<SaveIcon />}
            >
              Save Settings
            </Button>
            
            {settings.lastSaved && (
              <Text fontSize="sm" color="gray.500" mt={2}>
                Last saved: {settings.lastSaved}
              </Text>
            )}
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}; 