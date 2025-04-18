import React from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Container,
  useColorModeValue
} from '@chakra-ui/react';
import Layout from '../../../components/Layout';
import { ApiSettings } from './ApiSettings';

const Settings: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Layout>
      <Box mb={8}>
        <Heading mb={2}>Settings</Heading>
        <Text color="gray.500">Configure application settings and preferences</Text>
      </Box>
      
      <Tabs colorScheme="brand" variant="enclosed">
        <TabList>
          <Tab>API & Webhooks</Tab>
          <Tab>User Preferences</Tab>
          <Tab>Advanced</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={0} pt={4}>
            <ApiSettings />
          </TabPanel>
          
          <TabPanel>
            <Box 
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={bgColor}
            >
              <Heading size="md" mb={4}>User Preferences</Heading>
              <Text>User preference settings will be added here.</Text>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box 
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              bg={bgColor}
            >
              <Heading size="md" mb={4}>Advanced Settings</Heading>
              <Text>Advanced configuration options will be added here.</Text>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layout>
  );
};

export default Settings; 