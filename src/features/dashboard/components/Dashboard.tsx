import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Flex,
  Divider,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { WorkflowCard } from '../../workflows';
import { mockWorkflows } from '../../../data/mockData';
import Layout from '../../../components/Layout';
import { createChakraIcon } from '../../../utils';

// Create Chakra-compatible icon
const SearchIcon = createChakraIcon(FiSearch);

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const filteredWorkflows = useMemo(() => {
    return mockWorkflows.filter(workflow => {
      // Filter by category if not 'all'
      const categoryMatch = activeCategory === 'all' || workflow.category === activeCategory;
      
      // Filter by search term
      const searchMatch = 
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      return categoryMatch && searchMatch;
    });
  }, [searchTerm, activeCategory]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Layout activeCategory={activeCategory} onCategoryChange={handleCategoryChange}>
      <VStack spacing={6} align="stretch" width="100%">
        <Box>
          <Heading as="h1" size="lg" mb={2}>Workflow Dashboard</Heading>
          <Text color="gray.600">Launch and manage your automated workflows</Text>
        </Box>
        
        <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <HStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search workflows..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
            
            <Select 
              value={activeCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              maxW="300px"
            >
              <option value="all">All Categories</option>
              <option value="Lead Generation">Lead Generation</option>
              <option value="Lead Qualification">Lead Qualification</option>
              <option value="Lead Enrichment">Lead Enrichment</option>
              <option value="AI Personalization">AI Personalization</option>
              <option value="Replies & Follow-ups">Replies & Follow-ups</option>
              <option value="Campaign Management">Campaign Management</option>
              <option value="Data Integration">Data Integration</option>
              <option value="Analytics & Reporting">Analytics & Reporting</option>
            </Select>
          </HStack>
        </Box>
        
        <Divider />
        
        <VStack spacing={4} align="stretch">
          {filteredWorkflows.map(workflow => (
            <Box 
              key={workflow.id} 
              w="100%" 
              p={2} 
              borderRadius="md"
              _hover={{ 
                bg: hoverBgColor,
                transition: "all 0.2s" 
              }}
            >
              <WorkflowCard workflow={workflow} />
            </Box>
          ))}
        </VStack>
        
        {filteredWorkflows.length === 0 && (
          <Flex justify="center" p={8}>
            <Text color="gray.500">No workflows found matching your criteria.</Text>
          </Flex>
        )}
      </VStack>
    </Layout>
  );
};

export default Dashboard; 