import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Define a custom theme with brand colors
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f1ff',
      100: '#b8d7ff',
      200: '#8abeff',
      300: '#5ca5ff',
      400: '#2e8cff',
      500: '#1472e6',
      600: '#0e59b4',
      700: '#084082',
      800: '#042851',
      900: '#021020',
    },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
