import React from 'react';
import { Icon, IconProps } from '@chakra-ui/react';
import { IconType } from 'react-icons';

export const createChakraIcon = (icon: IconType) => {
  const ChakraIcon = React.forwardRef<HTMLElement, IconProps>((props, ref) => {
    return <Icon as={icon as any} ref={ref} {...props} />;
  });
  
  // Set display name for debugging
  ChakraIcon.displayName = `ChakraIcon(${(icon as any).name || 'Icon'})`;
  
  return ChakraIcon;
}; 