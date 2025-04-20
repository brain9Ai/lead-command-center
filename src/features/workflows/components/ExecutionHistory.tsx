import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Badge,
  IconButton,
  Tooltip,
  Flex,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiClock, FiDelete, FiRefreshCw } from 'react-icons/fi';
import { FeatureGuard, FeatureID } from '../../../features/featureFlags';
import { createChakraIcon } from '../../../utils';

interface ExecutionHistoryProps {
  title?: string;
  limit?: number;
  workflowId?: string;
}

/**
 * Displays a history of workflow executions, either all or filtered by workflow ID
 * 
 * Note: This component is now a simple placeholder since we've removed execution tracking
 */
export const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({
  title = 'Execution History',
  limit = 10,
  workflowId
}) => {
  const RefreshIcon = createChakraIcon(FiRefreshCw);
  const DeleteIcon = createChakraIcon(FiDelete);
  
  return (
    <Box>
      <Flex justify="space-between" mb={4}>
        <Heading size="md">{title}</Heading>
        
        <HStack>
          <Tooltip label="Execution history is disabled in this simplified version">
            <IconButton
              aria-label="Refresh executions"
              icon={<RefreshIcon />}
              size="sm"
              colorScheme="blue"
              variant="outline"
              isDisabled={true}
            />
          </Tooltip>
          
          <Tooltip label="Execution history is disabled in this simplified version">
            <IconButton
              aria-label="Clear history"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="outline"
              isDisabled={true}
            />
          </Tooltip>
        </HStack>
      </Flex>
      
      <Alert status="info" mb={4}>
        <AlertIcon />
        Execution history has been disabled in this simplified version. The application now only triggers workflows and displays immediate success/failure messages.
      </Alert>
    </Box>
  );
}; 