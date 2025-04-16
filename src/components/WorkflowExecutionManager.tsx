import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Select,
  Button,
  Flex,
  Checkbox,
  Grid,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  Stack,
  Progress,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Code,
  Icon,
} from '@chakra-ui/react';
import { FiPlay, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useWorkflows } from '../hooks/useWorkflows';
import { useWorkflowExecutions } from '../hooks/useWorkflowExecutions';
import { WorkflowCategory, WorkflowExecution } from '../types/workflows';
import Layout from './Layout';

const WorkflowExecutionManager: React.FC = () => {
  const { workflows, getWorkflowsByCategory } = useWorkflows();
  const { 
    executions,
    batches,
    loading,
    error,
    executeWorkflow,
    executeBatch,
    getExecutionsByWorkflowId,
    getExecutionsByBatchId,
    clearExecutions
  } = useWorkflowExecutions(workflows);

  const [selectedCategory, setSelectedCategory] = useState<WorkflowCategory | 'all'>('all');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const filteredWorkflows = getWorkflowsByCategory(selectedCategory);
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as WorkflowCategory | 'all');
    setSelectedWorkflows([]);
  };

  const handleWorkflowToggle = (workflowId: string) => {
    setSelectedWorkflows(prev => 
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWorkflows.length === filteredWorkflows.length) {
      // Deselect all
      setSelectedWorkflows([]);
    } else {
      // Select all
      setSelectedWorkflows(filteredWorkflows.map(w => w.id));
    }
  };

  const handleExecuteSelected = async () => {
    if (selectedWorkflows.length === 0) return;
    
    const result = await executeBatch(selectedWorkflows);
    
    if (result.success && result.batchId) {
      setSelectedBatchId(result.batchId);
    }
  };

  const handleExecuteSingle = async (workflowId: string) => {
    await executeWorkflow(workflowId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'running': return 'blue';
      default: return 'gray';
    }
  };

  const renderExecutionDetails = (execution: WorkflowExecution) => {
    const workflow = workflows.find(w => w.id === execution.workflowId);
    
    return (
      <Card key={execution.id} mb={2} size="sm">
        <CardBody>
          <Text fontWeight="bold">{workflow?.name || execution.workflowId}</Text>
          <Text fontWeight="medium" color={`${getStatusColor(execution.status)}.600`}>
            Status: {execution.status}
          </Text>
          <Text>Started: {formatDate(execution.startTime)}</Text>
          {execution.endTime && <Text>Finished: {formatDate(execution.endTime)}</Text>}
          {execution.parameters && Object.keys(execution.parameters).length > 0 && (
            <Box mt={2}>
              <Text fontWeight="medium">Parameters:</Text>
              <Code p={2} mt={1} fontSize="xs" w="100%" borderRadius="md" display="block">
                {JSON.stringify(execution.parameters, null, 2)}
              </Code>
            </Box>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <Layout
      activeCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg" mb={2}>Workflow Execution Manager</Heading>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <Box mb={6}>
          <Heading size="md" mb={2}>Select Workflows to Execute</Heading>
          
          <Box mb={4}>
            <Text mb={2}>Filter by Category:</Text>
            <Select 
              value={selectedCategory}
              onChange={handleCategoryChange}
              maxW="md"
            >
              <option value="all">All Categories</option>
              {Object.values(WorkflowCategory).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </Box>
          
          <Box mb={4}>
            <Flex justify="space-between" mb={2} align="center">
              <Heading size="sm">Available Workflows</Heading>
              <Button 
                onClick={handleSelectAll}
                size="xs"
                variant="link"
                colorScheme="blue"
              >
                {selectedWorkflows.length === filteredWorkflows.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Flex>
            
            <VStack 
              align="stretch" 
              spacing={0} 
              border="1px" 
              borderColor="gray.200" 
              borderRadius="md" 
              divider={<Divider />}
            >
              {filteredWorkflows.map(workflow => (
                <Flex p={3} key={workflow.id} align="flex-start">
                  <Checkbox 
                    id={`workflow-${workflow.id}`}
                    isChecked={selectedWorkflows.includes(workflow.id)}
                    onChange={() => handleWorkflowToggle(workflow.id)}
                    mr={3}
                    mt={1}
                  />
                  <Box>
                    <Text fontWeight="medium">{workflow.name}</Text>
                    <Text fontSize="sm" color="gray.600">{workflow.description}</Text>
                    <Flex mt={2}>
                      <Badge mr={2}>{workflow.category}</Badge>
                      <Button 
                        onClick={() => handleExecuteSingle(workflow.id)}
                        size="xs"
                        variant="link"
                        colorScheme="blue"
                      >
                        Run Single
                      </Button>
                    </Flex>
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>
          
          <Button 
            onClick={handleExecuteSelected}
            isDisabled={selectedWorkflows.length === 0 || loading}
            isLoading={loading}
            colorScheme="blue"
          >
            {loading ? 'Executing...' : `Execute Selected (${selectedWorkflows.length})`}
          </Button>
        </Box>
        
        {batches.length > 0 && (
          <Box mb={6}>
            <Heading size="md" mb={2}>Batch Executions</Heading>
            
            <VStack 
              align="stretch" 
              spacing={0} 
              border="1px" 
              borderColor="gray.200" 
              borderRadius="md" 
              divider={<Divider />}
            >
              {batches.map(batch => (
                <Box 
                  p={3} 
                  key={batch.id}
                  bg={selectedBatchId === batch.id ? 'blue.50' : 'transparent'}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="semibold">
                      Batch {batch.id.substring(0, 8)}... 
                      <Text as="span" ml={2} color={`${getStatusColor(batch.status)}.600`}>
                        {batch.status}
                      </Text>
                    </Text>
                    <Flex align="center">
                      <Button 
                        onClick={() => setSelectedBatchId(selectedBatchId === batch.id ? null : batch.id)}
                        size="sm"
                        variant="link"
                      >
                        {selectedBatchId === batch.id ? 'Hide Details' : 'Show Details'}
                      </Button>
                      <IconButton
                        aria-label={selectedBatchId === batch.id ? "Collapse" : "Expand"}
                        icon={selectedBatchId === batch.id ? <Icon as={FiChevronUp as any} /> : <Icon as={FiChevronDown as any} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedBatchId(selectedBatchId === batch.id ? null : batch.id)}
                      />
                    </Flex>
                  </Flex>
                  
                  <Flex fontSize="sm" mb={2}>
                    <Text mr={4}>Started: {formatDate(batch.startTime)}</Text>
                    {batch.endTime && <Text>Finished: {formatDate(batch.endTime)}</Text>}
                  </Flex>
                  
                  <Box mb={2}>
                    <Progress 
                      value={batch.progress} 
                      size="sm"
                      colorScheme={
                        batch.status === 'completed' ? 'green' :
                        batch.status === 'failed' ? 'red' :
                        'blue'
                      }
                      borderRadius="full"
                    />
                    <Text fontSize="xs" textAlign="right" mt={1}>{batch.progress}% Complete</Text>
                  </Box>
                  
                  {selectedBatchId === batch.id && (
                    <Box mt={4}>
                      <Text fontWeight="medium" mb={2}>Executions in this batch:</Text>
                      <VStack align="stretch" spacing={2}>
                        {getExecutionsByBatchId(batch.id).map(execution => renderExecutionDetails(execution))}
                      </VStack>
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}
        
        <Flex justify="space-between" align="center" mt={6}>
          <Heading size="md">Execution History</Heading>
          <Button 
            onClick={clearExecutions}
            size="sm"
            colorScheme="red"
          >
            Clear History
          </Button>
        </Flex>
        
        {executions.length === 0 ? (
          <Text color="gray.500" fontStyle="italic" mt={2}>No executions yet</Text>
        ) : (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mt={2}>
            {executions.slice().reverse().map(renderExecutionDetails)}
          </Grid>
        )}
      </VStack>
    </Layout>
  );
};

export default WorkflowExecutionManager; 