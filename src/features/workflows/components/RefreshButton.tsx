import React, { useState } from 'react';
import { Button, Tooltip } from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { useWorkflowExecution } from '../hooks/useWorkflowExecution';
import { createChakraIcon } from '../../../utils';

interface RefreshButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  colorScheme?: string;
  variant?: string;
  tooltipLabel?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  size = 'sm',
  colorScheme = 'gray',
  variant = 'ghost',
  tooltipLabel = 'Refresh status'
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { syncWithLocalStorage } = useWorkflowExecution();
  
  const RefreshIcon = createChakraIcon(FiRefreshCw);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncWithLocalStorage();
    
    // Add a small delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
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
