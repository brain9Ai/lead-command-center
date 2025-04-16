import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Divider,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
  Select,
  useToast
} from '@chakra-ui/react';
import { FiRefreshCw, FiTrash2, FiFilter } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { 
  ExecutionHistory,
  useWorkflowExecution,
  WorkflowStatus,
  RefreshButton
} from '../';
import Layout from '../../../components/Layout';
import { createChakraIcon } from '../../../utils';

const WorkflowExecutionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');
  
  const TrashIcon = createChakraIcon(FiTrash2);

  const { 
    refreshExecutions,
    clearExecutions,
    syncWithLocalStorage
  } = useWorkflowExecution();

  const refreshAllExecutions = async () => {
    setIsRefreshing(true);
    await syncWithLocalStorage();
    refreshExecutions();
    setIsRefreshing(false);
  };

  // Refresh executions on initial load
  useEffect(() => {
    refreshAllExecutions();
  }, []);

  // Apply filters based on tab
  const getFilteredWorkflows = () => {
    switch (activeTab) {
      case 0: // All executions
        return undefined;
      case 1: // Lead Generation
        return 'Lead Generation';
      case 2: // Lead Qualification
        return 'Lead Qualification';
      case 3: // Lead Enrichment
        return 'Lead Enrichment';
      case 4: // AI Personalization
        return 'AI Personalization';
      case 5: // Replies & Follow-ups
        return 'Replies & Follow-ups';
      default:
        return undefined;
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Layout isExecutionManagerActive={true}>
      <VStack spacing={6} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Heading size="lg" mb={2}>Execution Manager</Heading>
            <Text color="gray.500">
              Monitor and manage all workflow executions
            </Text>
          </Box>
          
          <HStack spacing={2}>
            <Select 
              size="sm" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | 'all')}
              width="auto"
              borderRadius="md"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="idle">Idle</option>
            </Select>
            
            <RefreshButton
              size="sm"
              tooltipLabel="Refresh all execution statuses"
            />
            
            <Button 
              size="sm"
              leftIcon={<TrashIcon />}
              onClick={clearExecutions}
              colorScheme="red"
              variant="outline"
            >
              Clear All
            </Button>
          </HStack>
        </Flex>
        
        <Card bg={cardBg} boxShadow="md" borderRadius="lg" overflow="hidden">
          <Tabs 
            colorScheme="brand" 
            onChange={(index) => setActiveTab(index)}
            variant="enclosed"
          >
            <CardHeader bg={headerBg} py={3} px={4}>
              <TabList>
                <Tab>All Executions</Tab>
                <Tab>Lead Generation</Tab>
                <Tab>Lead Qualification</Tab>
                <Tab>Lead Enrichment</Tab>
                <Tab>AI Personalization</Tab>
                <Tab>Replies & Follow-ups</Tab>
              </TabList>
            </CardHeader>
            
            <CardBody p={0}>
              <TabPanels>
                {/* The same ExecutionHistory component is used for all tabs, 
                    just filtered differently based on the active tab */}
                {[0, 1, 2, 3, 4, 5].map((tabIndex) => (
                  <TabPanel key={tabIndex} p={0}>
                    <ExecutionHistory 
                      workflowId={tabIndex === 0 ? undefined : getFilteredWorkflows()}
                      showTitle={false}
                      showFilters={false}
                      showClear={false}
                      showRefresh={false}
                    />
                  </TabPanel>
                ))}
              </TabPanels>
            </CardBody>
          </Tabs>
        </Card>
      </VStack>
    </Layout>
  );
};

export default WorkflowExecutionManager; 