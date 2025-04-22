import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  Switch,
  Text,
  useColorModeValue,
  Collapse,
  Divider,
  Flex,
  useToast,
  Alert,
  AlertIcon,
  Textarea,
  Grid,
  Badge,
  InputGroup,
  InputRightElement
} from '@chakra-ui/react';
import { FiPlay, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Workflow, WorkflowParameter } from '../types';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { FeatureGuard, FeatureID } from '../../../features/featureFlags';
import { createChakraIcon } from '../../../utils';

// Extended parameter type to support more parameter types
type ExtendedParameterType = WorkflowParameter['type'] | 'array';

interface WorkflowCardProps {
  workflow: Workflow;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow }) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [showParameters, setShowParameters] = useState(false);
  const toast = useToast();
  
  const PlayIcon = createChakraIcon(FiPlay);
  const ChevronUpIcon = createChakraIcon(FiChevronUp);
  const ChevronDownIcon = createChakraIcon(FiChevronDown);
  
  const { 
    executeWorkflow,
    executing,
    lastWorkflowMessage
  } = useWorkflowExecution();
  
  // Initialize parameters with default values from workflow definition
  useEffect(() => {
    if (workflow.parameters && workflow.parameters.length > 0) {
      const defaultParams = workflow.parameters.reduce((acc, param) => {
        // Only set default if it exists
        if (param.default !== undefined) {
          acc[param.name] = param.default;
        }
        return acc;
      }, {} as Record<string, any>);
      
      setParameters(prevParams => ({
        ...defaultParams,
        ...prevParams // Keep any user-entered values
      }));
    }
  }, [workflow.parameters]);
  
  const handleParameterChange = useCallback((name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const renderParameterInput = useCallback((param: WorkflowParameter) => {
    const value = parameters[param.name] ?? param.default;
    const paramType = param.type as string; // Use type assertion
    
    switch (paramType) {
      case 'boolean':
        return (
          <FormControl key={param.name}>
            <HStack justifyContent="space-between" spacing={4}>
              <FormLabel mb={0} htmlFor={param.name}>{param.label}</FormLabel>
              <Switch
                id={param.name}
                isChecked={Boolean(value)}
                onChange={e => handleParameterChange(param.name, e.target.checked)}
              />
            </HStack>
            {param.description && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {param.description}
              </Text>
            )}
          </FormControl>
        );
        
      case 'number':
        return (
          <FormControl key={param.name} isRequired={param.required}>
            <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
            <NumberInput
              id={param.name}
              value={value}
              onChange={val => handleParameterChange(param.name, Number(val))}
            >
              <NumberInputField />
            </NumberInput>
            {param.description && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {param.description}
              </Text>
            )}
          </FormControl>
        );
        
      case 'apikey':
        // API Key input with special handling for sensitive data
        return (
          <FormControl key={param.name} isRequired={param.required}>
            <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
            <InputGroup>
              <Input
                id={param.name}
                type="password"
                value={value}
                onChange={e => handleParameterChange(param.name, e.target.value)}
                placeholder="Enter API Key"
                autoComplete="off"
              />
              <InputRightElement>
                <Button
                  size="sm"
                  h="1.75rem"
                  onClick={() => {
                    // Toggle between password and text type temporarily
                    const input = document.getElementById(param.name) as HTMLInputElement;
                    if (input) {
                      input.type = input.type === 'password' ? 'text' : 'password';
                      setTimeout(() => {
                        if (input && input.type === 'text') {
                          input.type = 'password';
                        }
                      }, 1500); // Show plaintext for 1.5 seconds
                    }
                  }}
                >
                  Show
                </Button>
              </InputRightElement>
            </InputGroup>
            {param.description && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {param.description}
              </Text>
            )}
            {value && (
              <Text fontSize="xs" color="green.500" mt={1}>
                API Key set {value.length > 0 ? `(${value.substring(0, 3)}${'•'.repeat(6)})` : ''}
              </Text>
            )}
          </FormControl>
        );
        
      case 'object':
      case 'array':
        // For objects and arrays, use a textarea with JSON formatting
        return (
          <FormControl key={param.name} isRequired={param.required}>
            <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
            <Input
              id={param.name}
              as="textarea"
              resize="vertical"
              minHeight="100px"
              maxHeight="300px"
              rows={4}
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={e => {
                // Try to parse as JSON, but keep as string if invalid
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleParameterChange(param.name, parsed);
                } catch (err) {
                  // If not valid JSON, keep as string
                  handleParameterChange(param.name, e.target.value);
                }
              }}
              placeholder={`Enter ${paramType === 'array' ? 'comma-separated values or JSON array' : 'JSON object'}`}
              fontFamily="monospace"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {paramType === 'array' 
                ? 'Enter items as comma-separated values or as JSON array (e.g., "item1, item2" or ["item1", "item2"])' 
                : 'Enter as valid JSON object (e.g., {"key": "value"})'}
            </Text>
            {param.description && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {param.description}
              </Text>
            )}
          </FormControl>
        );
        
      default: // string or other types
        return (
          <FormControl key={param.name} isRequired={param.required}>
            <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
            <Textarea
              id={param.name}
              value={value}
              resize="vertical"
              minHeight="80px"
              overflowWrap='break-word'
              onChange={e => handleParameterChange(param.name, e.target.value)}
            />
            {param.description && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                {param.description}
              </Text>
            )}
          </FormControl>
        );
    }
  }, [parameters, handleParameterChange]);
  
  const handleExecute = useCallback(async () => {
    try {
      console.log('Workflow parameters definition:', workflow.parameters);
      console.log('Current parameters state:', parameters);
      
      // Get parameter values, ensuring they're the correct types
      const typedParameters = workflow.parameters?.reduce((acc, param) => {
        // Get the parameter value, falling back to default if not set
        let value = parameters[param.name] !== undefined ? parameters[param.name] : param.default;
        const paramType = param.type as string; // Use type assertion
        
        // Convert values to the correct type
        switch (paramType) {
          case 'number':
            // Convert string to number
            if (typeof value === 'string') {
              value = value === '' ? 0 : Number(value);
            }
            break;
            
          case 'boolean':
            // Convert string to boolean
            if (typeof value === 'string') {
              value = value === 'true';
            }
            break;
            
          case 'apikey':
            // Handle API key - ensure it's a string and securely store if needed
            if (value && typeof value !== 'string') {
              value = String(value);
            }
            
            // Log that we're using an API key parameter (but don't log the actual key)
            console.log(`Using API Key parameter for "${param.name}" (masked for security)`);
            break;
            
          case 'object':
            // Handle object parameters
            if (typeof value === 'string') {
              try {
                value = JSON.parse(value);
              } catch (e) {
                // If not valid JSON, keep as string
                console.warn(`Failed to parse object parameter "${param.name}":`, e);
              }
            }
            break;
            
          case 'array':
            // Handle array parameters
            if (typeof value === 'string') {
              // Handle comma-separated values
              if (value.includes(',')) {
                value = value.split(',').map(item => item.trim());
              } else {
                try {
                  // Try parsing as JSON array
                  value = JSON.parse(value);
                } catch (e) {
                  // If not valid JSON, convert to single-item array
                  value = value ? [value] : [];
                }
              }
            }
            break;
            
          default: // string or other types
            // Ensure it's a string
            if (value !== undefined && value !== null && typeof value !== 'string') {
              value = String(value);
            }
        }
        
        console.log(`Processing parameter "${param.name}" (${paramType}):`, { 
          originalValue: parameters[param.name], 
          defaultValue: param.default, 
          finalValue: value 
        });
        
        // Only include the parameter if it has a value or is explicitly set to null/false/0
        if (value !== undefined) {
          return { ...acc, [param.name]: value };
        }
        return acc;
      }, {} as Record<string, any>) || {};
      
      console.log('Final typedParameters:', typedParameters);
      
      // Validate required parameters
      const missingParams = workflow.parameters?.filter(param => {
        if (!param.required) return false;
        
        const paramValue = typedParameters[param.name];
        return paramValue === undefined || 
              (typeof paramValue === 'string' && paramValue === '');
      });
      
      if (missingParams && missingParams.length > 0) {
        toast({
          title: "Missing parameters",
          description: `Please fill in required parameters: ${missingParams.map(p => p.label).join(", ")}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Execute the workflow
      const response = await executeWorkflow(workflow as any, typedParameters);
      
      // Display toast with the execution result
      toast({
        title: response.success ? "Workflow Started" : "Workflow Failed",
        description: response.message,
        status: response.success ? "success" : "error",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [workflow, parameters, executeWorkflow, toast]);
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  const hasParameters = workflow.parameters && workflow.parameters.length > 0;
  
  return (
    <Card
      bg={bg}
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      width="100%"
      _hover={{ borderColor: 'blue.300', boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <CardBody>
        <Stack spacing={4}>
          {/* Row 1: Heading & Notification */}
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Heading size="md" fontWeight="semibold">{workflow.name}</Heading>
              <HStack mt={1}>
                <Badge colorScheme="blue">{workflow.category}</Badge>
              </HStack>
            </Box>
            
            {lastWorkflowMessage && (
              <Alert status={lastWorkflowMessage.type === 'success' ? 'success' : 'error'} size="sm" borderRadius="md" maxW="50%">
                <AlertIcon />
                {lastWorkflowMessage.text}
              </Alert>
            )}
          </Flex>
          
          <Divider />
          
          {/* Row 2: Parameters */}
          {hasParameters && (
            <Box>
              <Flex 
                justify="space-between" 
                align="center" 
                onClick={() => setShowParameters(!showParameters)}
                cursor="pointer"
                py={2}
                _hover={{ bg: hoverBg }}
                borderRadius="md"
                px={2}
              >
                <Text fontWeight="medium" fontSize="sm">
                  {showParameters ? 'Hide Parameters' : 'Show Parameters'}
                </Text>
                {showParameters ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </Flex>
              
              <Collapse in={showParameters}>
                <Box mt={3}>
                  <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={4}>
                    {workflow.parameters?.map(param => renderParameterInput(param))}
                  </Grid>
                </Box>
              </Collapse>
            </Box>
          )}

          <Divider />
          
          {/* Row 2: Workflow Details */}
          <Box>
            <Text fontSize="sm" color="gray.600">{workflow.description}</Text>
            <HStack mt={2} justifyContent="flex-end">
              <FeatureGuard featureId={FeatureID.WORKFLOW_TRIGGER}>
                <Button
                  leftIcon={<PlayIcon />}
                  colorScheme="blue"
                  onClick={handleExecute}
                  isLoading={executing}
                  loadingText="Starting"
                  size="sm"
                >
                  Execute
                </Button>
              </FeatureGuard>
            </HStack>
          </Box>

          {/* Future rows can be added here */}
        </Stack>
      </CardBody>
    </Card>
  );
};