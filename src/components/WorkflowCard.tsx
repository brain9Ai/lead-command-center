import React, { useState } from 'react';
import {
  Box,
  Button,
  Badge,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  Icon,
  Tooltip,
  Flex,
  Spacer,
  CircularProgress,
} from '@chakra-ui/react';
import { FiPlay, FiChevronDown, FiChevronUp, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { Workflow, WorkflowExecution } from '../types/workflows';

interface WorkflowCardProps {
  workflow: Workflow;
  onExecute: (workflowId: string, parameters: Record<string, any>) => Promise<any>;
  latestExecution: WorkflowExecution | null;
  isLoading: boolean;
}

const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'Lead Generation': 'blue',
    'Lead Qualification': 'purple',
    'Lead Enrichment': 'teal',
    'AI Personalization': 'orange',
    'Replies & Follow-ups': 'green',
  };
  
  return colorMap[category] || 'gray';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Icon as={FiCheckCircle as any} color="green.500" />;
    case 'failed':
      return <Icon as={FiAlertCircle as any} color="red.500" />;
    case 'running':
      return <CircularProgress size="16px" isIndeterminate color="blue.500" />;
    default:
      return <Icon as={FiClock as any} color="gray.500" />;
  }
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString();
};

const WorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  onExecute, 
  latestExecution,
  isLoading 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, any>>({});
  
  const handleToggle = () => setIsExpanded(!isExpanded);
  
  const handleInputChange = (name: string, value: any) => {
    setParamValues(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExecute = async () => {
    // Prepare parameters
    const parameters: Record<string, any> = {};
    
    // Add values from form
    if (workflow.parameters) {
      workflow.parameters.forEach(param => {
        if (paramValues[param.name] !== undefined) {
          parameters[param.name] = paramValues[param.name];
        } else if (param.default !== undefined) {
          parameters[param.name] = param.default;
        }
      });
    }
    
    await onExecute(workflow.id, parameters);
  };
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={bg}
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <Box p={5}>
        <HStack spacing={2} mb={2}>
          <Badge colorScheme={getCategoryColor(workflow.category)} fontSize="0.8em">
            {workflow.category}
          </Badge>
          
          {latestExecution && (
            <Tooltip label={`Status: ${latestExecution.status}`}>
              <Box>
                {getStatusIcon(latestExecution.status)}
              </Box>
            </Tooltip>
          )}
          
          <Spacer />
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            rightIcon={isExpanded ? <Icon as={FiChevronUp as any} /> : <Icon as={FiChevronDown as any} />}
          >
            {isExpanded ? 'Hide' : 'Configure'}
          </Button>
        </HStack>
        
        <Heading size="md" mb={2}>
          {workflow.name}
        </Heading>
        
        <Text fontSize="sm" color="gray.500" mb={4}>
          {workflow.description}
        </Text>
        
        {latestExecution && (
          <HStack fontSize="xs" color="gray.500" mb={2}>
            <Text>Last run: {formatTime(latestExecution.startTime)}</Text>
            {latestExecution.endTime && (
              <Text>Completed: {formatTime(latestExecution.endTime)}</Text>
            )}
          </HStack>
        )}
        
        <Collapse in={isExpanded} animateOpacity>
          <VStack spacing={4} align="stretch" mt={4} mb={4}>
            {workflow.parameters && workflow.parameters.map(param => (
              <FormControl key={param.name} isRequired={param.required}>
                <FormLabel fontSize="sm">{param.label}</FormLabel>
                
                {param.type === 'number' ? (
                  <NumberInput 
                    defaultValue={param.default} 
                    onChange={(_: string, value: number) => handleInputChange(param.name, value)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                ) : (
                  <Input 
                    placeholder={`Enter ${param.label.toLowerCase()}`}
                    defaultValue={param.default}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(param.name, e.target.value)}
                  />
                )}
                
                {param.description && (
                  <FormHelperText fontSize="xs">{param.description}</FormHelperText>
                )}
              </FormControl>
            ))}
          </VStack>
        </Collapse>
        
        <Flex justifyContent="flex-end">
          <Button 
            leftIcon={<Icon as={FiPlay as any} />}
            colorScheme="brand"
            size="sm"
            onClick={handleExecute}
            isLoading={isLoading}
            loadingText="Running"
          >
            Run Workflow
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default WorkflowCard; 