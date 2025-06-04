import './App.css'
import { FixDecoder } from './FixDecoder';
import { useColorMode } from './ColorModeContext';
import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

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
      <FixDecoder />
    </>
  )
}

export default App
