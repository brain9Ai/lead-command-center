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
  FiSettings
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { WorkflowCategory } from '../types/workflows';
import { createChakraIcon } from '../utils';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isExecutionManagerActive?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  onCategoryChange,
  isExecutionManagerActive: propIsExecutionManagerActive
}) => {
  const location = useLocation();
  const isExecutionManagerActive = propIsExecutionManagerActive !== undefined 
    ? propIsExecutionManagerActive 
    : location.pathname === '/executions';
  const isSettingsActive = location.pathname === '/settings';
  
  // Create Chakra-compatible icon components
  const ActivityIcon = createChakraIcon(FiActivity);
  const HomeIcon = createChakraIcon(FiHome);
  const ClockIcon = createChakraIcon(FiClock);
  const SettingsIcon = createChakraIcon(FiSettings);
  
  const categories: { id: string; name: string; icon: IconType }[] = [
    { id: 'all', name: 'All Workflows', icon: FiHome },
    { id: WorkflowCategory.LeadGeneration, name: 'Lead Generation', icon: FiZap },
    { id: WorkflowCategory.LeadQualification, name: 'Lead Qualification', icon: FiFilter },
    { id: WorkflowCategory.LeadEnrichment, name: 'Lead Enrichment', icon: FiSearch },
    { id: WorkflowCategory.AIPersonalization, name: 'AI Personalization', icon: FiMessageSquare },
    { id: WorkflowCategory.RepliesAndFollowups, name: 'Replies & Follow-ups', icon: FiMail },
  ];

  // Create a map of category icons
  const categoryIconComponents = React.useMemo(() => {
    const iconMap: Record<string, React.ComponentType> = {};
    categories.forEach(category => {
      iconMap[category.id] = createChakraIcon(category.icon);
    });
    return iconMap;
  }, [categories]);

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
            <ActivityIcon w={6} h={6} color="brand.500" />
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
          bg={!isExecutionManagerActive && !isSettingsActive && activeCategory === 'all' ? activeBg : 'transparent'}
          color={!isExecutionManagerActive && !isSettingsActive && activeCategory === 'all' ? activeColor : 'inherit'}
          _hover={{ bg: hoverBg }}
          onClick={() => onCategoryChange('all')}
        >
          <HStack spacing={3}>
            <HomeIcon />
            <Text fontWeight={!isExecutionManagerActive && !isSettingsActive && activeCategory === 'all' ? 'medium' : 'normal'}>
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
            <ClockIcon />
            <Text fontWeight={isExecutionManagerActive ? 'medium' : 'normal'}>
              Execution Manager
            </Text>
          </HStack>
        </Box>

        <Divider my={4} />
        
        <Text px={4} py={2} fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase">
          Workflow Categories
        </Text>
        
        {categories.slice(1).map((category) => {
          const CategoryIcon = categoryIconComponents[category.id];
          return (
            <Box
              key={category.id}
              as={Link}
              to="/"
              display="block"
              cursor="pointer"
              borderRadius="md"
              px={4}
              py={3}
              bg={!isExecutionManagerActive && !isSettingsActive && activeCategory === category.id ? activeBg : 'transparent'}
              color={!isExecutionManagerActive && !isSettingsActive && activeCategory === category.id ? activeColor : 'inherit'}
              _hover={{ bg: hoverBg }}
              onClick={() => onCategoryChange(category.id)}
            >
              <HStack spacing={3}>
                <CategoryIcon />
                <Text fontWeight={!isExecutionManagerActive && !isSettingsActive && activeCategory === category.id ? 'medium' : 'normal'}>
                  {category.name}
                </Text>
              </HStack>
            </Box>
          );
        })}

        <Divider my={4} />

        <Box 
          as={Link} 
          to="/settings"
          display="block"
          cursor="pointer"
          borderRadius="md"
          px={4}
          py={3}
          bg={isSettingsActive ? activeBg : 'transparent'}
          color={isSettingsActive ? activeColor : 'inherit'}
          _hover={{ bg: hoverBg }}
        >
          <HStack spacing={3}>
            <SettingsIcon />
            <Text fontWeight={isSettingsActive ? 'medium' : 'normal'}>
              Settings
            </Text>
          </HStack>
        </Box>
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