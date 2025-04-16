import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
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
  Flex
} from '@chakra-ui/react';
import { FiPlay, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { Workflow, WorkflowParameter, WorkflowExecution } from '../types';
import { WorkflowExecutionStatus } from './WorkflowExecutionStatus';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { FeatureGuard } from '../../../features/featureFlags';
import { FeatureID } from '../../../features/featureFlags/types';
import { createChakraIcon } from '../../../utils';

interface WorkflowCardProps {
  workflow: Workflow;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow }) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [showParameters, setShowParameters] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [latestExecution, setLatestExecution] = useState<WorkflowExecution | null>(null);
  
  const PlayIcon = createChakraIcon(FiPlay);
  const ChevronUpIcon = createChakraIcon(FiChevronUp);
  const ChevronDownIcon = createChakraIcon(FiChevronDown);
  
  const { 
    executeWorkflow, 
    getExecutionsByWorkflowId, 
    checkExecutionStatus,
    syncWithLocalStorage
  } = useWorkflowExecution();
  
  // Load latest execution
  const loadLatestExecution = useCallback(() => {
    const executions = getExecutionsByWorkflowId(workflow.id);
    if (executions.length > 0) {
      setLatestExecution(executions[0]);
    }
  }, [workflow.id, getExecutionsByWorkflowId]);
  
  // Get initial execution status on component mount
  useEffect(() => {
    // Sync with local storage first to ensure we have the latest status
    syncWithLocalStorage();
    loadLatestExecution();
    
    // Set up an interval to refresh the status periodically for running executions
    const intervalId = setInterval(() => {
      if (latestExecution && latestExecution.status === 'running') {
        checkExecutionStatus(latestExecution.id)
          .then(() => loadLatestExecution());
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [workflow.id, loadLatestExecution, latestExecution, checkExecutionStatus, syncWithLocalStorage]);
  
  const handleParameterChange = useCallback((name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const renderParameterInput = useCallback((param: WorkflowParameter) => {
    const value = parameters[param.name] ?? param.default;
    
    switch (param.type) {
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
        
      default: // string
        return (
          <FormControl key={param.name} isRequired={param.required}>
            <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
            <Input
              id={param.name}
              value={value}
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
    setIsExecuting(true);
    
    try {
      const response = await executeWorkflow(workflow, parameters);
      
      if (response.success && response.executionId) {
        // Wait a short time to let the execution register
        setTimeout(() => {
          loadLatestExecution();
          setIsExecuting(false);
        }, 500);
      } else {
        setIsExecuting(false);
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      setIsExecuting(false);
    }
  }, [workflow, parameters, executeWorkflow, loadLatestExecution]);
  
  const handleRefreshStatus = useCallback(async () => {
    if (latestExecution) {
      await checkExecutionStatus(latestExecution.id);
      loadLatestExecution();
    }
  }, [latestExecution, checkExecutionStatus, loadLatestExecution]);
  
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
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', borderColor: 'gray.300' }}
    >
      <CardBody>
        <Stack spacing={3}>
          <Heading size="md">{workflow.name}</Heading>
          <Text fontSize="sm">{workflow.description}</Text>
          
          {latestExecution && (
            <Box mt={2}>
              <Text fontSize="sm" fontWeight="medium" mb={1}>
                Latest Execution:
              </Text>
              <WorkflowExecutionStatus 
                execution={latestExecution} 
                onRefresh={handleRefreshStatus}
              />
            </Box>
          )}
          
          {hasParameters && (
            <>
              <Divider my={2} />
              
              <Flex
                alignItems="center"
                justifyContent="space-between"
                cursor="pointer"
                onClick={() => setShowParameters(!showParameters)}
                py={1}
                _hover={{ bg: hoverBg }}
                borderRadius="md"
                px={2}
              >
                <Text fontSize="sm" fontWeight="medium">
                  Parameters
                </Text>
                {showParameters ? 
                  <ChevronUpIcon boxSize={4} /> : 
                  <ChevronDownIcon boxSize={4} />
                }
              </Flex>
              
              <Collapse in={showParameters} animateOpacity>
                <Box pt={2} pb={1}>
                  <Stack spacing={4}>
                    {workflow.parameters?.map(renderParameterInput)}
                  </Stack>
                </Box>
              </Collapse>
            </>
          )}
        </Stack>
      </CardBody>
      
      <CardFooter pt={0}>
        <FeatureGuard featureId={FeatureID.WORKFLOW_TRIGGER}>
          <Button
            leftIcon={<PlayIcon />}
            colorScheme="brand"
            onClick={handleExecute}
            isLoading={isExecuting}
            loadingText="Executing"
            width="100%"
          >
            Execute Workflow
          </Button>
        </FeatureGuard>
      </CardFooter>
    </Card>
  );
};