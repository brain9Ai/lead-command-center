import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Heading,
  Flex,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiTrash2, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { WorkflowExecution } from '../types/workflows';

interface ExecutionHistoryProps {
  executions: WorkflowExecution[];
  workflowNames: Record<string, string>;
  onClearHistory: () => void;
}

const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  executions,
  workflowNames,
  onClearHistory,
}) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon as={FiCheckCircle as any} color="green.500" mr={1} />;
      case 'failed':
        return <Icon as={FiAlertCircle as any} color="red.500" mr={1} />;
      case 'running':
        return <Icon as={FiClock as any} color="blue.500" mr={1} />;
      default:
        return <Icon as={FiClock as any} color="gray.500" mr={1} />;
    }
  };

  const formatTime = (date: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString();
  };

  const calculateDuration = (start: Date, end?: Date) => {
    if (!end) return 'In progress';
    
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const durationMs = endMs - startMs;
    
    // Format duration as seconds if less than a minute, otherwise minutes
    if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    }
    
    return `${(durationMs / 60000).toFixed(1)}m`;
  };

  const reversedExecutions = [...executions].reverse();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor} 
      bg={bg}
      boxShadow="sm"
      overflow="hidden"
    >
      <Box p={4}>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="md">Execution History</Heading>
          <Button 
            size="sm" 
            leftIcon={<Icon as={FiTrash2 as any} />}
            colorScheme="red" 
            variant="outline"
            onClick={onClearHistory}
            isDisabled={executions.length === 0}
          >
            Clear History
          </Button>
        </Flex>
        
        {executions.length === 0 ? (
          <Text color="gray.500" py={6} textAlign="center">
            No workflow executions yet. Run a workflow to see its execution history.
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Workflow</Th>
                  <Th>Status</Th>
                  <Th>Start Time</Th>
                  <Th>End Time</Th>
                  <Th>Duration</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reversedExecutions.map((execution) => (
                  <Tr key={execution.id}>
                    <Td>
                      <Text fontWeight="medium">
                        {workflowNames[execution.workflowId] || execution.workflowId}
                      </Text>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={getStatusColor(execution.status)}
                        display="flex"
                        alignItems="center"
                        width="fit-content"
                      >
                        {getStatusIcon(execution.status)}
                        {execution.status}
                      </Badge>
                    </Td>
                    <Td>{formatTime(execution.startTime)}</Td>
                    <Td>{execution.endTime ? formatTime(execution.endTime) : 'In progress'}</Td>
                    <Td>{calculateDuration(execution.startTime, execution.endTime)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExecutionHistory; 