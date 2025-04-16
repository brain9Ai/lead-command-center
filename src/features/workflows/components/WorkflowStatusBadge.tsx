import React, { useState } from 'react';
import {
  Badge,
  Flex,
  Tooltip,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { WorkflowStatus } from '../types';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { createChakraIcon } from '../../../utils';

interface WorkflowStatusBadgeProps {
  executionId: string;
  status: WorkflowStatus;
  showRefresh?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRefresh?: () => void;
}

export const WorkflowStatusBadge: React.FC<WorkflowStatusBadgeProps> = ({
  executionId,
  status,
  showRefresh = true,
  size = 'md',
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { checkExecutionStatus } = useWorkflowExecution();
  
  const RefreshIcon = createChakraIcon(FiRefreshCw);

  // Get status configuration
  const getStatusConfig = (status: WorkflowStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          colorScheme: 'green',
        };
      case 'failed':
        return {
          label: 'Failed',
          colorScheme: 'red',
        };
      case 'running':
        return {
          label: 'Running',
          colorScheme: 'blue',
        };
      case 'idle':
      default:
        return {
          label: 'Idle',
          colorScheme: 'gray',
        };
    }
  };

  const config = getStatusConfig(status);
  
  // Determine the badge size
  const badgeSizes = {
    sm: {
      fontSize: 'xs',
      px: 2,
      py: 1
    },
    md: {
      fontSize: 'sm',
      px: 3,
      py: 1
    },
    lg: {
      fontSize: 'md',
      px: 4,
      py: 2
    }
  };
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    if (onRefresh) {
      // Use the custom onRefresh handler if provided
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    } else {
      // Otherwise check the execution status directly
      try {
        await checkExecutionStatus(executionId);
      } catch (error) {
        console.error('Error refreshing status:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <Flex align="center">
      <Badge
        colorScheme={config.colorScheme}
        borderRadius="full"
        {...badgeSizes[size]}
      >
        {status === 'running' && (
          <Spinner size="xs" mr={1} speed="0.8s" />
        )}
        {config.label}
      </Badge>
      
      {showRefresh && (
        <Tooltip label="Refresh status" placement="top">
          <Button
            size="xs"
            variant="ghost"
            ml={1}
            onClick={handleRefresh}
            isLoading={isRefreshing}
            aria-label="Refresh status"
          >
            <RefreshIcon boxSize={3} />
          </Button>
        </Tooltip>
      )}
    </Flex>
  );
};

export default WorkflowStatusBadge; 