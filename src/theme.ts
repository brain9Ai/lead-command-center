import { extendTheme } from '@chakra-ui/react';

// Define theme configuration
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80c9ff',
      300: '#4db3ff',
      400: '#1a9cff',
      500: '#0080e6',
      600: '#0066b3',
      700: '#004d80',
      800: '#00334d',
      900: '#001a26',
    },
  },
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme; 