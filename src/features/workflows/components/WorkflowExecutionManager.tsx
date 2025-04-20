import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { ExecutionHistory } from './ExecutionHistory';
import { FeatureGuard, FeatureID } from '../../../features/featureFlags';

/**
 * Component to manage and display workflow executions
 * Now simplified to just show a message about the disabled status tracking
 */
export const WorkflowExecutionManager: React.FC = () => {
  return (
    <FeatureGuard featureId={FeatureID.STATUS_MONITORING}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Workflow Execution Manager</Heading>
            <Text color="gray.500">View and manage workflow executions</Text>
          </Box>
          
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Execution Tracking Disabled
            </AlertTitle>
            <AlertDescription maxWidth="lg">
              The workflow execution tracking has been disabled in this simplified version.
              The application now only triggers workflows and displays immediate success/failure messages.
              <br /><br />
              Return to the Dashboard to execute workflows.
            </AlertDescription>
          </Alert>
          
          <ExecutionHistory />
        </VStack>
      </Container>
    </FeatureGuard>
  );
}; 