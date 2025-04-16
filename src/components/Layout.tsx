import React, { ReactNode } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import { WorkflowCategory } from '../types/workflows';

interface LayoutProps {
  children: ReactNode;
  activeCategory: WorkflowCategory | 'all';
  onCategoryChange: (category: WorkflowCategory | 'all') => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Sidebar 
        activeCategory={activeCategory} 
        onCategoryChange={onCategoryChange} 
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