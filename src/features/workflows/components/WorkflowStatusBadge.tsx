import React, { useState } from 'react';
import {
  Badge,
  Flex,
  Tooltip,
  Button,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { WorkflowStatus } from '../types';
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
  const toast = useToast();
  
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
    
    try {
      if (onRefresh) {
        // Use the custom onRefresh handler if provided
        onRefresh();
      } else {
        // Simple feedback when no handler is provided
        console.log(`Refreshing status for execution ${executionId}`);
        toast({
          title: "Status refreshed",
          status: "info",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast({
        title: "Refresh failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      // Add a small delay for better UX
      setTimeout(() => setIsRefreshing(false), 500);
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