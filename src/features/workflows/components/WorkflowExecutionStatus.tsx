import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  Text,
  Flex,
  Tooltip,
  Button,
  useColorModeValue,
  HStack,
  Spinner,
  Tag,
  TagLeftIcon,
  TagLabel,
  useToast
} from '@chakra-ui/react';
import { 
  FiCheck, 
  FiX, 
  FiLoader, 
  FiClock, 
  FiRefreshCw, 
  FiHelpCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import { WorkflowExecution, WorkflowStatus } from '../types';
import { WorkflowExecutionStatus as WorkflowExecutionStatusEnum } from '../types';
import { IconType } from 'react-icons';
import { createChakraIcon } from '../../../utils';

interface WorkflowExecutionStatusProps {
  execution: WorkflowExecution;
  onRefresh?: () => void;
  showRefresh?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTimestamp?: boolean;
}

export const WorkflowExecutionStatus: React.FC<WorkflowExecutionStatusProps> = ({
  execution,
  onRefresh,
  showRefresh = true,
  size = 'md',
  showTimestamp = true
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  
  const RefreshIcon = createChakraIcon(FiRefreshCw);
  const CheckIcon = createChakraIcon(FiCheck);
  const XIcon = createChakraIcon(FiX);
  const LoaderIcon = createChakraIcon(FiLoader);
  const ClockIcon = createChakraIcon(FiClock);
  const HelpCircleIcon = createChakraIcon(FiHelpCircle);
  const WarningIcon = createChakraIcon(FiAlertTriangle);

  // Color values based on theme
  const completedBgColor = useColorModeValue('green.50', 'green.900');
  const failedBgColor = useColorModeValue('red.50', 'red.900');
  const runningBgColor = useColorModeValue('blue.50', 'blue.900');
  const idleBgColor = useColorModeValue('gray.50', 'gray.900');
  const unknownBgColor = useColorModeValue('gray.50', 'gray.900');

  const getStatusConfig = (status: WorkflowStatus | WorkflowExecutionStatusEnum) => {
    // Convert enum value to string if it's an enum type
    let statusStr: string;
    
    if (typeof status === 'string') {
      statusStr = status;
    } else if (status && typeof status === 'object') {
      // Use a type assertion to handle the toString call safely
      statusStr = (status as any).toString();
    } else {
      statusStr = String(status);
    }
    
    switch (statusStr) {
      case 'idle':
      case 'pending':
        return {
          label: 'Pending',
          IconComponent: ClockIcon,
          color: 'gray',
          bgColor: idleBgColor
        };
      case 'running':
        return {
          label: 'Running',
          IconComponent: LoaderIcon,
          color: 'blue',
          bgColor: runningBgColor
        };
      case 'completed':
        return {
          label: 'Completed',
          IconComponent: CheckIcon,
          color: 'green',
          bgColor: completedBgColor
        };
      case 'failed':
        return {
          label: 'Failed',
          IconComponent: XIcon,
          color: 'red',
          bgColor: failedBgColor
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          IconComponent: WarningIcon,
          color: 'orange', 
          bgColor: 'orange.100'
        };
      default:
        return {
          label: 'Unknown',
          IconComponent: HelpCircleIcon,
          color: 'gray',
          bgColor: unknownBgColor
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        onRefresh();
      } else {
        // Default behavior when no callback is provided
        console.log(`Refreshing status for execution ${execution.id}`);
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
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const config = getStatusConfig(execution.status);
  
  // Determine size values
  const fontSizeMap = {
    sm: 'xs',
    md: 'sm',
    lg: 'md'
  };
  
  const iconSizeMap = {
    sm: 3,
    md: 4,
    lg: 5
  };
  
  const paddingMap = {
    sm: 1,
    md: 2,
    lg: 3
  };
  
  const StatusIcon = config.IconComponent;
  
  return (
    <Box>
      <Flex align="center">
        <Tag size={size} variant="subtle" colorScheme={config.color}>
          <TagLeftIcon as={StatusIcon} />
          <TagLabel>{config.label}</TagLabel>
        </Tag>
        
        {showRefresh && !["idle", "unknown"].includes(execution.status) && (
          <Tooltip label="Refresh Status" hasArrow placement="top">
            <Button
              ml={2}
              size="xs"
              variant="ghost"
              isLoading={isRefreshing}
              onClick={handleRefresh}
              aria-label="Refresh status"
            >
              <RefreshIcon />
            </Button>
          </Tooltip>
        )}
      </Flex>
      
      {showTimestamp && (
        <HStack spacing={1} mt={1} fontSize="xs" color="gray.500">
          {execution.startTime && (
            <Text>
              Started: {formatDate(execution.startTime)}
            </Text>
          )}
          
          {execution.endTime && (
            <Text>
              • Finished: {formatDate(execution.endTime)}
            </Text>
          )}
        </HStack>
      )}
    </Box>
  );
};