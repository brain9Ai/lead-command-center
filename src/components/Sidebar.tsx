import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiZap,
  FiFilter,
  FiSearch,
  FiMessageSquare,
  FiMail,
  FiHome,
  FiActivity,
  FiPlay,
  FiClock,
} from 'react-icons/fi';
import { WorkflowCategory } from '../types/workflows';

interface SidebarProps {
  activeCategory: WorkflowCategory | 'all';
  onCategoryChange: (category: WorkflowCategory | 'all') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onCategoryChange }) => {
  const location = useLocation();
  const isExecutionManagerActive = location.pathname === '/executions';
  
  const categories = [
    { id: 'all', name: 'All Workflows', icon: FiHome },
    { id: WorkflowCategory.LeadGeneration, name: 'Lead Generation', icon: FiZap },
    { id: WorkflowCategory.LeadQualification, name: 'Lead Qualification', icon: FiFilter },
    { id: WorkflowCategory.LeadEnrichment, name: 'Lead Enrichment', icon: FiSearch },
    { id: WorkflowCategory.AIPersonalization, name: 'AI Personalization', icon: FiMessageSquare },
    { id: WorkflowCategory.RepliesAndFollowups, name: 'Replies & Follow-ups', icon: FiMail },
  ];

  const bg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('brand.50', 'gray.700');
  const activeColor = useColorModeValue('brand.500', 'brand.200');

  return (
    <Box
      as="nav"
      h="100vh"
      bg={bg}
      borderRightWidth="1px"
      borderColor={borderColor}
      w="250px"
      py={8}
      position="sticky"
      top={0}
    >
      <VStack align="stretch" spacing={1} mx={2}>
        <Box px={4} mb={6}>
          <Flex align="center" mb={6}>
            <Icon as={FiActivity as any} w={6} h={6} color="brand.500" />
            <Text ml={2} fontWeight="bold" fontSize="lg">
              Command Center
            </Text>
          </Flex>
          <Text fontSize="xs" color="gray.500">
            Trigger and monitor workflows from a central dashboard
          </Text>
        </Box>

        {/* Main navigation */}
        <Box 
          as={Link} 
          to="/"
          display="block"
          cursor="pointer"
          borderRadius="md"
          px={4}
          py={3}
          bg={!isExecutionManagerActive && activeCategory === 'all' ? activeBg : 'transparent'}
          color={!isExecutionManagerActive && activeCategory === 'all' ? activeColor : 'inherit'}
          _hover={{ bg: hoverBg }}
          onClick={() => onCategoryChange('all')}
        >
          <HStack spacing={3}>
            <Icon as={FiHome as any} />
            <Text fontWeight={!isExecutionManagerActive && activeCategory === 'all' ? 'medium' : 'normal'}>
              Dashboard
            </Text>
          </HStack>
        </Box>

        <Box 
          as={Link} 
          to="/executions"
          display="block"
          cursor="pointer"
          borderRadius="md"
          px={4}
          py={3}
          bg={isExecutionManagerActive ? activeBg : 'transparent'}
          color={isExecutionManagerActive ? activeColor : 'inherit'}
          _hover={{ bg: hoverBg }}
        >
          <HStack spacing={3}>
            <Icon as={FiClock as any} />
            <Text fontWeight={isExecutionManagerActive ? 'medium' : 'normal'}>
              Execution Manager
            </Text>
          </HStack>
        </Box>

        <Divider my={4} />
        
        <Text px={4} py={2} fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
          Workflow Categories
        </Text>
        
        {categories.slice(1).map((category) => (
          <Box
            key={category.id}
            as={Link}
            to="/"
            display="block"
            cursor="pointer"
            borderRadius="md"
            px={4}
            py={3}
            bg={!isExecutionManagerActive && activeCategory === category.id ? activeBg : 'transparent'}
            color={!isExecutionManagerActive && activeCategory === category.id ? activeColor : 'inherit'}
            _hover={{ bg: hoverBg }}
            onClick={() => onCategoryChange(category.id as WorkflowCategory | 'all')}
          >
            <HStack spacing={3}>
              <Icon as={category.icon as any} />
              <Text fontWeight={!isExecutionManagerActive && activeCategory === category.id ? 'medium' : 'normal'}>
                {category.name}
              </Text>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Box px={6} position="absolute" bottom={6} left={0} right={0}>
        <Text fontSize="xs" color="gray.500">
          Version 1.0.0 | Core Functionality
          <br />
          <br />
          © 2025 Lead Command Center
        </Text>
      </Box>
    </Box>
  );
};

export default Sidebar; 