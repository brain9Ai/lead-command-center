import React, { useState } from 'react';
import { Button, Tooltip, useToast } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { createChakraIcon } from '../../../utils';

interface RefreshButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  variant?: string;
  tooltipLabel?: string;
  onRefresh?: () => Promise<void>;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  size = 'sm',
  colorScheme = 'gray',
  variant = 'ghost',
  tooltipLabel = 'Refresh status',
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  
  const RefreshIcon = createChakraIcon(FiRefreshCw);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Default refresh behavior if no callback provided
        console.log('Refresh triggered');
        toast({
          title: "Refreshed",
          status: "success",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error during refresh:', error);
      toast({
        title: "Refresh failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      // Add a small delay for better UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  return (
    <Tooltip label={tooltipLabel} placement="top">
      <Button
        size={size}
        colorScheme={colorScheme}
        variant={variant}
        isLoading={isRefreshing}
        onClick={handleRefresh}
        aria-label="Refresh status"
        leftIcon={<RefreshIcon />}
      >
        Refresh
      </Button>
    </Tooltip>
  );
};

export default RefreshButton;
