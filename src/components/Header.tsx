import React from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FiDatabase } from 'react-icons/fi';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Lead Automation Command Center' }) => {
  return (
    <Box
      as="header"
      bg={useColorModeValue('white', 'gray.800')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      py={4}
      px={6}
      boxShadow="sm"
    >
      <Flex alignItems="center" justifyContent="space-between">
        <HStack spacing={3}>
          <Box
            bg="brand.500"
            p={2}
            borderRadius="md"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiDatabase as any} boxSize={5} />
          </Box>
          <Heading size="md" fontWeight="600">
            {title}
          </Heading>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          v1.0.0 - Core Functionality
        </Text>
      </Flex>
    </Box>
  );
};

export default Header; 