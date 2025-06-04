import './App.css'
import React from 'react';
import { FixDecoder } from './FixDecoder';
import { useColorMode } from './ColorModeContext';
import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(_error: any, _errorInfo: any) {
    // You can log errorInfo here if needed
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: 24 }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();

  return (
    <>
      <span style={{ visibility: 'hidden' }}>{mode}</span>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 1rem', width: '100%' }}>
        <IconButton onClick={toggleColorMode} color="inherit" aria-label="toggle dark mode">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <span style={{ marginLeft: 8, fontSize: 14, color: theme.palette.text.secondary }}>
          {theme.palette.mode === 'dark' ? 'Dark' : 'Light'} mode
        </span>
      </div>
      <ErrorBoundary>
        <FixDecoder />
      </ErrorBoundary>
    </>
  )
}

export default App
