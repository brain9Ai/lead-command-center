import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Heading,
  Text,
  Flex,
  useColorModeValue,
  Icon,
  Badge,
  Tooltip,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select
} from '@chakra-ui/react';
import { 
  FiRefreshCw, 
  FiTrash2, 
  FiClock,
  FiFilter,
  FiChevronDown 
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { WorkflowExecution, WorkflowStatus } from '../types';
import { WorkflowExecutionStatus } from './WorkflowExecutionStatus';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { FeatureGuard } from '../../../features/featureFlags';
import { FeatureID } from '../../../features/featureFlags/types';
import { RefreshButton } from './RefreshButton';
import { createChakraIcon } from '../../../utils/iconUtils';

interface ExecutionHistoryProps {
  workflowId?: string;
  limit?: number;
  title?: string;
  showTitle?: boolean;
  showFilters?: boolean;
  showClear?: boolean;
  showRefresh?: boolean;
}

export const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  workflowId,
  limit = 10,
  title = 'Execution History',
  showTitle = true,
  showFilters = true,
  showClear = true,
  showRefresh = true
}) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all');
  
  const TrashIcon = createChakraIcon(FiTrash2);
  const ClockIcon = createChakraIcon(FiClock);
  const RefreshIcon = createChakraIcon(FiRefreshCw);
  const ChevronDownIcon = createChakraIcon(FiChevronDown);
  
  const { 
    getRecentExecutions, 
    getExecutionsByWorkflowId, 
    clearExecutions, 
    refreshExecutions,
    checkExecutionStatus,
    syncWithLocalStorage
  } = useWorkflowExecution();
  
  const loadExecutions = () => {
    if (workflowId) {
      setExecutions(getExecutionsByWorkflowId(workflowId));
    } else {
      setExecutions(getRecentExecutions(limit));
    }
  };
  
  // Load executions on mount and when dependencies change
  useEffect(() => {
    loadExecutions();
  }, [workflowId, limit]);
  
  // Handle refresh 
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Sync with local storage first to get the latest status updates
    await syncWithLocalStorage();
    
    // Then refresh the execution store
    refreshExecutions();
    
    // Then reload the executions from store
    loadExecutions();
    
    // If we have few executions, we can efficiently check their status one by one
    if (executions.length <= 5) {
      for (const execution of executions) {
        await checkExecutionStatus(execution.id);
      }
      // Reload again to get the updated statuses
      refreshExecutions();
      loadExecutions();
    }
    
    setIsRefreshing(false);
  };
  
  // Handle clear
  const handleClear = () => {
    clearExecutions();
    loadExecutions();
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Filter executions based on status
  const filteredExecutions = statusFilter === 'all'
    ? executions
    : executions.filter(execution => execution.status === statusFilter);
  
  // Get workflow name from ID (would typically come from a workflow store)
  const getWorkflowName = (id: string) => {
    // This would be replaced with a lookup from your workflow store
    return id;
  };
  
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <FeatureGuard featureId={FeatureID.STATUS_MONITORING}>
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden"
        borderColor={borderColor}
      >
        {showTitle && (
          <Flex 
            p={4} 
            justify="space-between" 
            align="center" 
            bg={headerBg}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            <Heading size="sm">{title}</Heading>
            
            <HStack spacing={2}>
              {showFilters && (
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
              )}
              
              {showRefresh && (
                <RefreshButton 
                  size="sm"
                  variant="ghost"
                  tooltipLabel="Refresh executions"
                />
              )}
              
              {showClear && (
                <Tooltip label="Clear all executions">
                  <Button
                    size="sm"
                    onClick={handleClear}
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Clear all executions"
                  >
                    <TrashIcon />
                  </Button>
                </Tooltip>
              )}
            </HStack>
          </Flex>
        )}
        
        {filteredExecutions.length === 0 ? (
          <Box p={6} textAlign="center">
            <ClockIcon boxSize={10} color="gray.400" mb={3} />
            <Text color="gray.500">No execution history available</Text>
            <Text fontSize="sm" color="gray.400" mt={1}>
              Execute a workflow to see its status here
            </Text>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg={headerBg}>
                <Tr>
                  <Th>ID</Th>
                  {!workflowId && <Th>Workflow</Th>}
                  <Th>Status</Th>
                  <Th>Started</Th>
                  <Th>Finished</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredExecutions.map((execution) => (
                  <Tr key={execution.id}>
                    <Td fontFamily="mono" fontSize="xs" fontWeight="medium">
                      {execution.id.split('-')[0]}...
                    </Td>
                    {!workflowId && (
                      <Td>{getWorkflowName(execution.workflowId)}</Td>
                    )}
                    <Td>
                      <WorkflowExecutionStatus 
                        execution={execution} 
                        size="sm" 
                        showTimestamp={false}
                        showRefresh={false}
                      />
                    </Td>
                    <Td fontSize="xs">{formatDate(execution.startTime)}</Td>
                    <Td fontSize="xs">
                      {execution.endTime ? formatDate(execution.endTime) : '—'}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Tooltip label="Refresh status">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => checkExecutionStatus(execution.id)}
                            aria-label="Refresh status"
                          >
                            <RefreshIcon boxSize={3} />
                          </Button>
                        </Tooltip>
                        <Menu>
                          <MenuButton
                            as={Button}
                            size="xs"
                            variant="ghost"
                            rightIcon={<ChevronDownIcon />}
                          >
                            Actions
                          </MenuButton>
                          <MenuList>
                            <MenuItem onClick={() => window.alert('View details')}>
                              View Details
                            </MenuItem>
                            <MenuItem onClick={() => window.alert('View logs')}>
                              View Logs
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </FeatureGuard>
  );
}; 