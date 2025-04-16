import React, { ReactNode } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';

// Make the CategoryFilter more flexible
type CategoryFilter = string;

interface LayoutProps {
  children: ReactNode;
  activeCategory?: CategoryFilter;
  onCategoryChange?: (category: CategoryFilter) => void;
  isExecutionManagerActive?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeCategory = 'all', 
  onCategoryChange = () => {}, 
  isExecutionManagerActive = false
}) => {
  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Sidebar 
        activeCategory={activeCategory} 
        onCategoryChange={onCategoryChange} 
        isExecutionManagerActive={isExecutionManagerActive}
      />
      
      {/* Main content area */}
      <Flex direction="column" flex="1" overflowY="auto">
        <Header />
        <Box p={6} flex="1">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout; 