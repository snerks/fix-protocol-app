import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

interface ColorModeContextType {
    mode: 'light' | 'dark';
    toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
    mode: 'light',
    toggleColorMode: () => { },
});

export function useColorMode() {
    return useContext(ColorModeContext);
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<'light' | 'dark'>(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
        }),
        [mode]
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}
