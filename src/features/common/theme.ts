import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// Color mode config (optional)
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Brand colors - a blue-centric palette
const colors = {
  brand: {
    50: '#e6f2ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0073e6', // Primary brand color
    600: '#0059b3',
    700: '#004080',
    800: '#00264d',
    900: '#000d1a',
  },
};

// Component-specific overrides
const components = {
  Button: {
    // Define button styles that use brand colors
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          _disabled: {
            bg: 'brand.300',
          },
        },
        _active: {
          bg: 'brand.700',
        },
      },
    },
  },
};

// Create and export theme
export const theme = extendTheme({ config, colors, components }); 