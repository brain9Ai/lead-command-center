import React from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Stack,
  Switch,
  Text,
  useColorModeValue,
  VStack
} from '@chakra-ui/react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { Feature, ReleasePhase } from '../types';

export const FeatureFlagsSettings: React.FC = () => {
  const {
    features,
    isEnabled,
    toggleFeature,
    enableFeaturesByPhase,
    resetFeatures,
    getFeaturesByPhase
  } = useFeatureFlags();

  const initialPhaseFeatures = getFeaturesByPhase(ReleasePhase.INITIAL);
  const secondPhaseFeatures = getFeaturesByPhase(ReleasePhase.SECOND);
  const thirdPhaseFeatures = getFeaturesByPhase(ReleasePhase.THIRD);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  const renderFeatureItem = (feature: Feature) => (
    <Flex
      key={feature.id}
      justify="space-between"
      align="center"
      p={3}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      mb={2}
    >
      <Box>
        <Text fontWeight="medium">{feature.name}</Text>
        <Text fontSize="sm" color={subtitleColor}>
          {feature.description}
        </Text>
      </Box>
      <Switch
        colorScheme="brand"
        isChecked={isEnabled(feature.id)}
        onChange={() => toggleFeature(feature.id)}
      />
    </Flex>
  );

  return (
    <Box>
      <Heading size="md" mb={4}>
        Feature Flags Settings
      </Heading>
      <Text fontSize="sm" color={subtitleColor} mb={4}>
        Enable or disable features based on your requirements.
      </Text>

      <Box mb={5} p={5} borderRadius="md" bg={cardBg} shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="sm">{ReleasePhase.INITIAL}</Heading>
          <Button size="sm" onClick={() => enableFeaturesByPhase(ReleasePhase.INITIAL)}>
            Enable All
          </Button>
        </Flex>
        <VStack align="stretch" spacing={2}>
          {initialPhaseFeatures.map(renderFeatureItem)}
        </VStack>
      </Box>

      <Box mb={5} p={5} borderRadius="md" bg={cardBg} shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="sm">{ReleasePhase.SECOND}</Heading>
          <Button size="sm" onClick={() => enableFeaturesByPhase(ReleasePhase.SECOND)}>
            Enable All
          </Button>
        </Flex>
        <VStack align="stretch" spacing={2}>
          {secondPhaseFeatures.map(renderFeatureItem)}
        </VStack>
      </Box>

      <Box mb={5} p={5} borderRadius="md" bg={cardBg} shadow="sm">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="sm">{ReleasePhase.THIRD}</Heading>
          <Button size="sm" onClick={() => enableFeaturesByPhase(ReleasePhase.THIRD)}>
            Enable All
          </Button>
        </Flex>
        <VStack align="stretch" spacing={2}>
          {thirdPhaseFeatures.map(renderFeatureItem)}
        </VStack>
      </Box>

      <Divider my={4} />

      <Button
        variant="outline"
        colorScheme="red"
        size="sm"
        onClick={resetFeatures}
      >
        Reset to Defaults
      </Button>
    </Box>
  );
}; 