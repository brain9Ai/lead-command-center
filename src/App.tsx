import React, { useState, useMemo } from 'react';
import { 
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import { 
  Box, 
  Heading, 
  Text, 
  VStack,
  SimpleGrid,
  Button,
  Flex,
  useToast,
  Icon,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';
import { FiPlay } from 'react-icons/fi';
import Layout from './components/Layout';
import WorkflowCard from './components/WorkflowCard';
import ExecutionHistory from './components/ExecutionHistory';
import WorkflowExecutionManager from './components/WorkflowExecutionManager';
import { WorkflowCategory } from './types/workflows';
import { useWorkflows } from './hooks/useWorkflows';

const Dashboard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<WorkflowCategory | 'all'>('all');
  const toast = useToast();
  
  const { 
    workflows, 
    executions, 
    loading, 
    executeWorkflow, 
    executeWorkflowsByCategory,
    getLatestExecution,
    getWorkflowsByCategory,
    clearExecutions
  } = useWorkflows();
  
  // Filter workflows by category
  const filteredWorkflows = useMemo(() => {
    return getWorkflowsByCategory(activeCategory);
  }, [getWorkflowsByCategory, activeCategory]);
  
  // Create a map of workflow names for the execution history
  const workflowNames = useMemo(() => {
    return workflows.reduce((acc, workflow) => {
      acc[workflow.id] = workflow.name;
      return acc;
    }, {} as Record<string, string>);
  }, [workflows]);
  
  // Determine the active category label
  const activeCategoryLabel = useMemo(() => {
    if (activeCategory === 'all') {
      return 'All Workflows';
    }
    return activeCategory;
  }, [activeCategory]);

  // Handle running all workflows in a category
  const handleRunAllInCategory = async () => {
    if (activeCategory === 'all') {
      toast({
        title: 'Select a category',
        description: 'Please select a specific category to run all workflows',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await executeWorkflowsByCategory(activeCategory);
      
      if (result.success) {
        toast({
          title: 'Workflows started',
          description: `Started all workflows in ${activeCategory}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error starting workflows',
          description: result.error,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout 
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    >
      <VStack spacing={6} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="lg" mb={2}>{activeCategoryLabel}</Heading>
            <Text color="gray.500">
              {activeCategory === 'all' 
                ? 'All available workflows in the system' 
                : `Workflows for ${activeCategory} phase`}
            </Text>
          </Box>
          
          {activeCategory !== 'all' && (
            <Button 
              colorScheme="brand"
              leftIcon={<Icon as={FiPlay as any} />}
              isLoading={loading}
              onClick={handleRunAllInCategory}
            >
              Run All {activeCategory} Workflows
            </Button>
          )}
        </Flex>
        
        <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
          {filteredWorkflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onExecute={executeWorkflow}
              latestExecution={getLatestExecution(workflow.id)}
              isLoading={loading}
            />
          ))}
        </SimpleGrid>
        
        <Box mt={8}>
          <ExecutionHistory 
            executions={executions} 
            workflowNames={workflowNames}
            onClearHistory={clearExecutions}
          />
        </Box>
      </VStack>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/executions" component={WorkflowExecutionManager} />
      </Switch>
    </Router>
  );
};

export default App;
