import { createTheme, type PaletteMode } from '@mui/material/styles';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#3b82f6' : '#2563eb',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#1e293b' : '#e2e8f0',
        contrastText: isDark ? '#f1f5f9' : '#0f172a',
      },
      error: { main: isDark ? '#f87171' : '#dc2626' },
      warning: { main: isDark ? '#fbbf24' : '#d97706' },
      info: { main: isDark ? '#38bdf8' : '#0284c7' },
      success: { main: isDark ? '#4ade80' : '#16a34a' },
      background: {
        default: isDark ? '#0b1220' : '#f8fafc',
        paper: isDark ? '#111c2e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      divider: isDark ? '#263449' : '#e2e8f0',
    },
    typography: {
      fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    spacing: 8,
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
    },
  });
}
